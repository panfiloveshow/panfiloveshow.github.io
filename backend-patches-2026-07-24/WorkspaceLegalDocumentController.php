<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkSpace;
use App\Models\WorkspaceLegalDocument;
use App\Models\WorkspaceLegalEntity;
use App\Services\ActivityService;
use App\Services\Billing\PlanCatalog;
use App\Services\Legal\WorkspaceContractPdfGenerator;
use App\Services\Legal\WorkspaceInvoiceNumberGenerator;
use App\Services\Legal\WorkspaceInvoicePdfGenerator;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Throwable;

class WorkspaceLegalDocumentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private ActivityService $activityService,
        private WorkspaceContractPdfGenerator $contractGenerator,
        private WorkspaceInvoicePdfGenerator $invoiceGenerator,
        private WorkspaceInvoiceNumberGenerator $invoiceNumberGenerator,
        private PlanCatalog $planCatalog
    ) {
    }

    public function index(WorkSpace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);

        return response()->json([
            'data' => $workspace->legalDocuments()
                ->latest()
                ->get()
                ->map(fn (WorkspaceLegalDocument $document) => $this->serialize($document)),
        ]);
    }

    public function generateContract(Request $request, WorkSpace $workspace): JsonResponse
    {
        $this->authorizeManageLegal($request, $workspace);

        $legalEntity = $workspace->legalEntity;

        if (! $legalEntity || $legalEntity->status !== 'complete') {
            return response()->json([
                'message' => 'Workspace legal entity is incomplete.',
            ], 422);
        }

        try {
            $generatedFile = $this->contractGenerator->generate($workspace, $legalEntity);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Unable to generate workspace legal contract PDF.',
            ], 500);
        }

        $document = WorkspaceLegalDocument::create([
            'workspace_id' => $workspace->id,
            'legal_entity_id' => $legalEntity->id,
            'document_type' => WorkspaceLegalDocument::TYPE_CONTRACT,
            'document_number' => $generatedFile['metadata']['contract_number'] ?? null,
            'template_version' => $generatedFile['template_version'],
            'template_sha256' => $generatedFile['template_sha256'],
            'status' => WorkspaceLegalDocument::STATUS_GENERATED,
            'storage_path' => $generatedFile['storage_path'],
            'file_name' => $generatedFile['file_name'],
            'mime_type' => $generatedFile['mime_type'],
            'sha256' => $generatedFile['sha256'],
            'metadata' => $generatedFile['metadata'],
            'generated_at' => $generatedFile['generated_at'],
        ]);

        $this->activityService->createForUser($request->user(), $workspace, [
            'action' => 'workspace_legal_contract_generated',
            'title' => 'Workspace legal contract generated',
            'description' => $document->file_name,
            'meta' => ['document_id' => $document->id],
        ]);

        return response()->json([
            'data' => $this->serialize($document),
        ], 201);
    }

    public function generateInvoice(Request $request, WorkSpace $workspace): JsonResponse
    {
        $this->authorizeGenerateInvoice($request, $workspace);

        $validated = $request->validate([
            'plan' => ['nullable', 'string', Rule::in(PlanCatalog::planKeys())],
            'period' => ['nullable', 'integer', 'min:1'],
        ]);

        $legalEntity = $workspace->legalEntity;
        $legalEntityError = $this->validateInvoiceLegalEntity($legalEntity);

        if ($legalEntityError !== null) {
            return $legalEntityError;
        }

        $plan = $validated['plan'] ?? $workspace->type;

        if (! in_array($plan, PlanCatalog::planKeys(), true)) {
            return response()->json([
                'message' => 'Неизвестный тариф для выставления счёта',
                'errors' => [
                    'plan' => ['Неизвестный тариф для выставления счёта'],
                ],
            ], 422);
        }

        $period = (int) ($validated['period'] ?? 1);
        $monthlyAmount = $this->planCatalog->monthlyPriceForWorkspace($workspace, $plan);

        if ($monthlyAmount <= 0) {
            return response()->json([
                'message' => 'Не задана стоимость тарифа для выставления счёта',
                'errors' => [
                    'plan' => ['Не задана стоимость тарифа для выставления счёта'],
                ],
            ], 422);
        }

        $generatedAt = now();
        $invoiceNumber = $this->invoiceNumberGenerator->next($generatedAt);
        $paidUntilPreview = $this->paidUntilPreview($workspace, $period);
        $amount = $monthlyAmount * $period;

        try {
            $generatedFile = $this->invoiceGenerator->generate(
                $workspace,
                $legalEntity,
                $invoiceNumber,
                $plan,
                $period,
                $monthlyAmount,
                $amount,
                $generatedAt,
                $paidUntilPreview
            );
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Unable to generate workspace legal invoice PDF.',
            ], 500);
        }

        $document = WorkspaceLegalDocument::create([
            'workspace_id' => $workspace->id,
            'legal_entity_id' => $legalEntity->id,
            'document_type' => WorkspaceLegalDocument::TYPE_INVOICE,
            'document_number' => $invoiceNumber,
            'period_month' => $generatedAt->format('Y-m'),
            'template_version' => $generatedFile['template_version'],
            'template_sha256' => $generatedFile['template_sha256'],
            'status' => WorkspaceLegalDocument::STATUS_GENERATED,
            'storage_path' => $generatedFile['storage_path'],
            'file_name' => $generatedFile['file_name'],
            'mime_type' => $generatedFile['mime_type'],
            'sha256' => $generatedFile['sha256'],
            'metadata' => $generatedFile['metadata'],
            'generated_at' => $generatedFile['generated_at'],
        ]);

        $this->activityService->createForUser($request->user(), $workspace, [
            'action' => 'workspace_legal_invoice_generated',
            'title' => 'Workspace legal invoice generated',
            'description' => $document->file_name,
            'meta' => [
                'document_id' => $document->id,
                'invoice_number' => $invoiceNumber,
            ],
        ]);

        return response()->json([
            'data' => $this->serialize($document),
        ]);
    }

    public function download(Request $request, WorkSpace $workspace, WorkspaceLegalDocument $document)
    {
        $this->authorize('view', $workspace);

        abort_unless($document->workspace_id === $workspace->id, 404);
        abort_unless(Storage::disk('local')->exists($document->storage_path), 404);

        $this->activityService->createForUser($request->user(), $workspace, [
            'action' => 'workspace_legal_document_downloaded',
            'title' => 'Workspace legal document downloaded',
            'description' => $document->file_name,
            'meta' => ['document_id' => $document->id],
        ]);

        return Storage::disk('local')->download(
            $document->storage_path,
            $document->file_name,
            ['Content-Type' => $document->mime_type]
        );
    }

    public function destroy(Request $request, WorkSpace $workspace, WorkspaceLegalDocument $document): JsonResponse
    {
        $this->authorizeManageLegal($request, $workspace);

        abort_unless($document->workspace_id === $workspace->id, 404);

        if (in_array($document->status, [WorkspaceLegalDocument::STATUS_SIGNED, 'paid'], true)) {
            return response()->json([
                'message' => 'Подписанные и оплаченные документы удалить нельзя.',
            ], 422);
        }

        if ($document->storage_path && Storage::disk('local')->exists($document->storage_path)) {
            Storage::disk('local')->delete($document->storage_path);
        }

        $sourceDocx = $document->metadata['source_docx_path'] ?? null;

        if (is_string($sourceDocx) && $sourceDocx !== '' && Storage::disk('local')->exists($sourceDocx)) {
            Storage::disk('local')->delete($sourceDocx);
        }

        $this->activityService->createForUser($request->user(), $workspace, [
            'action' => 'workspace_legal_document_deleted',
            'title' => 'Workspace legal document deleted',
            'description' => $document->file_name,
            'meta' => ['document_id' => $document->id],
        ]);

        $document->delete();

        return response()->json(null, 204);
    }

    private function serialize(WorkspaceLegalDocument $document): array
    {
        return [
            'id' => $document->id,
            'workspaceId' => $document->workspace_id,
            'legalEntityId' => $document->legal_entity_id,
            'documentType' => $document->document_type,
            'periodMonth' => $document->period_month,
            'templateVersion' => $document->template_version,
            'templateSha256' => $document->template_sha256,
            'status' => $document->status,
            'fileName' => $document->file_name,
            'mimeType' => $document->mime_type,
            'sha256' => $document->sha256,
            'metadata' => $document->metadata,
            'generatedAt' => optional($document->generated_at)->toIso8601String(),
            'acceptedAt' => optional($document->accepted_at)->toIso8601String(),
            'createdAt' => optional($document->created_at)->toIso8601String(),
            'updatedAt' => optional($document->updated_at)->toIso8601String(),
        ];
    }

    private function authorizeManageLegal(Request $request, WorkSpace $workspace): void
    {
        $user = $request->user();

        if ($user->isAdmin() || $workspace->user_id === $user->id) {
            return;
        }

        $role = DB::table('user_work_space')
            ->join('roles', 'user_work_space.role_id', '=', 'roles.id')
            ->where('user_work_space.user_id', $user->id)
            ->where('user_work_space.work_space_id', $workspace->id)
            ->value('roles.slug');

        abort_unless(in_array($role, ['owner', 'admin'], true), 403, 'Forbidden');
    }

    private function authorizeGenerateInvoice(Request $request, WorkSpace $workspace): void
    {
        $user = $request->user();

        if ($workspace->user_id === $user->id) {
            return;
        }

        $role = DB::table('user_work_space')
            ->join('roles', 'user_work_space.role_id', '=', 'roles.id')
            ->where('user_work_space.user_id', $user->id)
            ->where('user_work_space.work_space_id', $workspace->id)
            ->value('roles.slug');

        abort_unless($role === 'owner', 403, 'Forbidden');
    }

    private function validateInvoiceLegalEntity(?WorkspaceLegalEntity $legalEntity): ?JsonResponse
    {
        if (! $legalEntity || ! in_array($legalEntity->status, [
            WorkspaceLegalEntity::STATUS_COMPLETE,
            WorkspaceLegalEntity::STATUS_VERIFIED,
        ], true)) {
            return response()->json([
                'message' => 'Заполните и сохраните юридические данные workspace',
                'errors' => [
                    'legalEntity' => ['Заполните и сохраните юридические данные workspace'],
                ],
            ], 422);
        }

        if (! in_array($legalEntity->entity_type, ['ip', 'ooo'], true)) {
            return response()->json([
                'message' => 'Счёт на оплату выставляется только для ИП и ООО',
                'errors' => [
                    'entityType' => ['Счёт на оплату выставляется только для ИП и ООО'],
                ],
            ], 422);
        }

        $required = [
            'legal_name' => 'legalName',
            'inn' => 'inn',
            'legal_address' => 'legalAddress',
            'bank_name' => 'bankName',
            'bank_bik' => 'bankBik',
            'bank_account' => 'bankAccount',
        ];

        if ($legalEntity->entity_type === 'ooo') {
            $required['kpp'] = 'kpp';
            $required['ogrn'] = 'ogrn';
        }

        if ($legalEntity->entity_type === 'ip') {
            $required['ogrn'] = 'ogrn';
        }

        $missing = [];

        foreach ($required as $attribute => $field) {
            if (trim((string) $legalEntity->{$attribute}) === '') {
                $missing[$field] = ['Поле '.$field.' обязательно для выставления счёта'];
            }
        }

        if ($missing !== []) {
            return response()->json([
                'message' => 'Не заполнены обязательные реквизиты: '.implode(', ', array_keys($missing)),
                'errors' => $missing,
            ], 422);
        }

        return null;
    }

    private function paidUntilPreview(WorkSpace $workspace, int $period): \Illuminate\Support\Carbon
    {
        $base = $workspace->paid_until && $workspace->paid_until->isFuture()
            ? $workspace->paid_until->copy()
            : now();

        return $base->addMonthsNoOverflow($period);
    }
}
