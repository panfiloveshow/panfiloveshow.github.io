#!/usr/bin/env bash
# Сводка по AI-краулерам и переходам из AI-сервисов в nginx combined access log.

set -euo pipefail

LOG_FILE="${1:-/var/log/nginx/sellico_access.log}"
if [ ! -r "$LOG_FILE" ]; then
  echo "Лог недоступен для чтения: $LOG_FILE" >&2
  echo "Запустите: sudo bash $0 $LOG_FILE" >&2
  exit 1
fi

echo "AI traffic report"
echo "Generated: $(date -Iseconds)"
echo "Log: $LOG_FILE"
echo

LC_ALL=C awk -F'"' '
function bot_source(ua) {
  if (ua ~ /OAI-SearchBot/) return "OAI-SearchBot"
  if (ua ~ /ChatGPT-User/) return "ChatGPT-User"
  if (ua ~ /GPTBot/) return "GPTBot"
  if (ua ~ /PerplexityBot/) return "PerplexityBot"
  if (ua ~ /Perplexity-User/) return "Perplexity-User"
  if (ua ~ /Claude-SearchBot/) return "Claude-SearchBot"
  if (ua ~ /Claude-User/) return "Claude-User"
  if (ua ~ /ClaudeBot|anthropic-ai/) return "ClaudeBot"
  if (ua ~ /bingbot/) return "Bingbot"
  if (ua ~ /Googlebot/) return "Googlebot"
  return ""
}

function referral_source(ref) {
  if (ref ~ /chatgpt\.com|openai\.com/) return "ChatGPT"
  if (ref ~ /perplexity\.ai/) return "Perplexity"
  if (ref ~ /claude\.ai|anthropic\.com/) return "Claude"
  if (ref ~ /gemini\.google\.com|bard\.google\.com/) return "Gemini"
  if (ref ~ /copilot\.microsoft\.com/) return "Copilot"
  return ""
}

{
  request = $2
  referrer = $4
  user_agent = $6
  split(request, request_parts, " ")
  path = request_parts[2]

  bot = bot_source(user_agent)
  if (bot != "") {
    bot_count[bot]++
    bot_path[bot SUBSEP path]++
  }

  referral = referral_source(referrer)
  if (referral != "") {
    referral_count[referral]++
    referral_path[referral SUBSEP path]++
  }
}

END {
  print "Crawler requests:"
  crawler_total = 0
  for (name in bot_count) {
    printf "- %s: %d\n", name, bot_count[name]
    crawler_total += bot_count[name]
  }
  if (crawler_total == 0) print "- none"

  print ""
  print "AI referrals:"
  referral_total = 0
  for (name in referral_count) {
    printf "- %s: %d\n", name, referral_count[name]
    referral_total += referral_count[name]
  }
  if (referral_total == 0) print "- none"

  print ""
  print "Crawler paths:"
  path_total = 0
  for (key in bot_path) {
    split(key, parts, SUBSEP)
    printf "- %s\t%d\t%s\n", parts[1], bot_path[key], parts[2]
    path_total += bot_path[key]
  }
  if (path_total == 0) print "- none"

  print ""
  print "Referral paths:"
  referral_path_total = 0
  for (key in referral_path) {
    split(key, parts, SUBSEP)
    printf "- %s\t%d\t%s\n", parts[1], referral_path[key], parts[2]
    referral_path_total += referral_path[key]
  }
  if (referral_path_total == 0) print "- none"
}
' "$LOG_FILE"
