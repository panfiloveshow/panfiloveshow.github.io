#!/usr/bin/env python3
"""Render a patch of the inspected Sellico config; never reload or edit nginx in place."""
import argparse
from pathlib import Path
import re


TARGET_LINK = (
    'add_header Link \'</.well-known/api-catalog>; rel="api-catalog", '
    '</openapi.json>; rel="service-desc", </agents.md>; rel="service-doc", '
    '</llms.txt>; rel="llms", '
    '</.well-known/ai-catalog.json>; rel="describedby", '
    '</.well-known/mcp/server-card.json>; rel="mcp-server-card", '
    '</.well-known/agent-card.json>; rel="agent-card"\' always;'
)
PERMISSIONS_HEADER = 'add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;'
COOP_HEADER = 'add_header Cross-Origin-Opener-Policy "same-origin-allow-popups" always;'
CSP_HEADER = (
    'add_header Content-Security-Policy '
    '"default-src \'self\'; script-src \'self\' https://mc.yandex.ru https://mc.yandex.com; '
    'connect-src \'self\' https://mc.yandex.ru https://mc.yandex.com https://yandex.ru https://yandex.com; '
    'img-src \'self\' data: https://mc.yandex.ru https://mc.yandex.com; '
    'style-src \'self\' \'unsafe-inline\'; font-src \'self\' data:; '
    'frame-src https://mc.yandex.ru https://mc.yandex.com; object-src \'none\'; base-uri \'self\'; '
    'form-action \'self\' mailto:; frame-ancestors \'none\'; '
    'upgrade-insecure-requests" always;'
)
PUBLIC_LOCATIONS = ['= /', '= /unit-economics/', '= /seo-cards/', '/']


def _braces(line: str) -> tuple[int, int]:
    opens = closes = 0
    quote = None
    for ch in line:
        if quote:
            if ch == quote:
                quote = None
        elif ch in '"\'':
            quote = ch
        elif ch == '#':
            break
        elif ch == '{':
            opens += 1
        elif ch == '}':
            closes += 1
    return opens, closes


def ensure_public_headers(source: str) -> str:
    """Idempotently ensure Link + Permissions-Policy + COOP + strict CSP + /seo 404 boundary + auth XFO."""
    link_re = re.compile(r'(?m)^([ \t]*)add_header Link \'[^\']*\' always;[ \t]*$')
    source = link_re.sub(lambda m: m.group(1) + TARGET_LINK, source, count=1)

    for selector in PUBLIC_LOCATIONS:
        header_re = re.compile(r'(?m)^([ \t]*)location ' + re.escape(selector) + r'[ \t]*\{[ \t]*$')
        matches = list(header_re.finditer(source))
        if len(matches) != 1:
            raise ValueError(f'Expected one location {selector}; configuration was not changed')
        m = matches[0]
        inner_indent = m.group(1) + '\t'
        lines = source[m.start():].splitlines(keepends=True)
        depth = 0
        end_offset = m.start()
        for line in lines:
            o, c = _braces(line)
            depth += o - c
            end_offset += len(line)
            if depth == 0:
                break
        if depth != 0:
            raise ValueError(f'Unbalanced braces in location {selector}')
        block_text = source[m.end():end_offset]
        csp_line_re = re.compile(r'(?m)^([ \t]*)add_header Content-Security-Policy "[^"]*" always;[ \t]*$')
        if csp_line_re.search(block_text):
            updated_block = csp_line_re.sub(lambda cm: cm.group(1) + CSP_HEADER, block_text, count=1)
            source = source[:m.end()] + updated_block + source[end_offset:]
            end_offset = m.end() + len(updated_block)
            block_text = updated_block
        has_sec_snippet = 'include snippets/sellico-security-headers.conf;' in block_text
        if has_sec_snippet:
            # Avoid duplicate headers when snippets/sellico-security-headers.conf already sets them.
            for dup_hdr in ('Permissions-Policy', 'Cross-Origin-Opener-Policy'):
                dup_re = re.compile(r'(?m)^[ \t]*add_header ' + dup_hdr + r' "[^"]*" always;[ \t]*\n?')
                updated_block = dup_re.sub('', block_text)
                if updated_block != block_text:
                    source = source[:m.end()] + updated_block + source[end_offset:]
                    end_offset = m.end() + len(updated_block)
                    block_text = updated_block
        extra = []
        if not has_sec_snippet and 'add_header Permissions-Policy ' not in block_text:
            extra.append('\n' + inner_indent + PERMISSIONS_HEADER)
        if not has_sec_snippet and 'add_header Cross-Origin-Opener-Policy ' not in block_text:
            extra.append('\n' + inner_indent + COOP_HEADER)
        if 'add_header Content-Security-Policy ' not in block_text:
            extra.append('\n' + inner_indent + CSP_HEADER)
        if extra:
            source = source[:m.end()] + ''.join(extra) + source[m.end():]

    # Fix soft-404 on /seo-audit-test-* and other unknown /seo* paths: restrict CRM /seo match
    # to exact /seo and /seo/ prefix instead of unanchored ^~ /seo.
    seo_prefix_re = re.compile(r'(?m)^([ \t]*)location \^~ /seo \{ try_files \$uri \$uri/ @crm_spa; \}[ \t]*$')
    if seo_prefix_re.search(source):
        source = seo_prefix_re.sub(
            lambda m: (
                f'{m.group(1)}location = /seo {{ try_files /__nonexistent @crm_spa; }}\n'
                f'{m.group(1)}location ^~ /seo/ {{ try_files $uri $uri/ @crm_spa; }}'
            ),
            source,
            count=1,
        )

    # Protect CRM auth/diagnostic entry routes with X-Frame-Options: DENY + frame-ancestors 'none'
    # without breaking iframe embedding on /booking or /roadmap/public.
    if 'location @crm_spa_auth' not in source and 'location @crm_spa {' in source:
        crm_spa_re = re.compile(r'(?m)^([ \t]*)location @crm_spa \{')
        source = crm_spa_re.sub(
            lambda m: (
                f'{m.group(1)}location @crm_spa_auth {{\n'
                f'{m.group(1)}\tinclude snippets/sellico-security-headers.conf;\n'
                f'{m.group(1)}\troot /var/www/html/frontend/dist;\n'
                f'{m.group(1)}\ttry_files /index.html =404;\n'
                f'{m.group(1)}\tadd_header X-Frame-Options "DENY" always;\n'
                f'{m.group(1)}\tadd_header Cache-Control "no-cache, no-store, must-revalidate" always;\n'
                f'{m.group(1)}\tadd_header Pragma "no-cache" always;\n'
                f'{m.group(1)}\tadd_header Expires "0" always;\n'
                f'{m.group(1)}}}\n\n'
                f'{m.group(0)}'
            ),
            source,
            count=1,
        )
    for auth_path in ['/login', '/register', '/forgot-password', '/reset-password', '/diagnostic']:
        auth_re = re.compile(
            r'(?m)^([ \t]*)location \^~ ' + re.escape(auth_path) + r' \{ try_files \$uri \$uri/ @crm_spa; \}[ \t]*$'
        )
        source = auth_re.sub(
            lambda m, p=auth_path: f'{m.group(1)}location ^~ {p} {{ try_files $uri $uri/ @crm_spa_auth; }}',
            source,
            count=1,
        )

    # Hide Nginx version string on both www and main server blocks.
    if 'server_tokens off;' not in source:
        source = re.sub(
            r'(?m)^([ \t]*)(server_name\s+(?:www\.)?sellico\.ru;)$',
            lambda m: f'{m.group(1)}{m.group(2)}\n{m.group(1)}server_tokens off;',
            source,
        )

    return source


def prepare(source: str, snippet: str) -> str:
    marker = '# sellico-agent-discovery: representation'
    if marker in source:
        if source.count(marker) != 4 or f'include {snippet};' not in source:
            raise ValueError('Partial or different agent-discovery configuration; inspect it before applying')
        return ensure_public_headers(source)

    root = re.compile(r'(?m)^([ \t]*)root /var/www/html/landing/dist;[ \t]*$')
    if len(root.findall(source)) != 1:
        raise ValueError('Expected exactly one landing root; configuration was not changed')
    source = root.sub(lambda match: match[0] + f'\n{match[1]}include {snippet};', source)
    for selector in PUBLIC_LOCATIONS:
        header = re.compile(r'(?m)^([ \t]*)location ' + re.escape(selector) + r'[ \t]*\{[ \t]*$')
        if len(header.findall(source)) != 1:
            raise ValueError(f'Expected one location {selector}; configuration was not changed')

        def insert(match):
            indent = match[1] + '\t'
            lines = [
                marker,
                'if ($sellico_accept_markdown) { return 418; }',
                'add_header Vary Accept always;',
                PERMISSIONS_HEADER,
                COOP_HEADER,
                CSP_HEADER,
            ]
            if selector == '= /':
                lines.append(TARGET_LINK)
            return match[0] + '\n' + '\n'.join(indent + line for line in lines)

        source = header.sub(insert, source)
    return source


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--snippet', default='/etc/nginx/snippets/sellico-agent-discovery.conf')
    args = parser.parse_args()
    if args.source.resolve() == args.output.resolve():
        parser.error('Use a separate output file; in-place edits are not supported')
    if not re.fullmatch(r'/[a-zA-Z0-9_./-]+', args.snippet):
        parser.error('Snippet must be an absolute nginx-safe path')
    args.output.write_text(prepare(args.source.read_text(), args.snippet))
    print(f'Prepared {args.output}; review the diff and run nginx -t before installing')
