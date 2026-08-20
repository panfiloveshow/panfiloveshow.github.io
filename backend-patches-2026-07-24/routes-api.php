<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\WorkSpaceController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ClientFileController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\IntegrationController;
use App\Http\Controllers\Api\CoordinationController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\FunnelStageController;
use App\Http\Controllers\Api\DealFieldController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ReviewLimitController;
use App\Http\Controllers\Api\ReviewTemplateController;
use App\Http\Controllers\Api\CollectorController;
use App\Http\Controllers\Api\UnitsController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\NewsCommentController;
use App\Http\Controllers\Api\NewsReactionController;
use App\Http\Controllers\Api\NewsCommentReactionController;
use App\Http\Controllers\Api\NewsPollController;
use App\Http\Controllers\RoadmapController;
use App\Http\Controllers\TaskSubtaskController;
use App\Http\Controllers\Api\NotificationPreferenceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\JitsiController;
use App\Http\Controllers\Api\MeetingController;
use App\Http\Controllers\Api\MeetInvitationController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\SupportTicketController;
use App\Http\Controllers\Api\WorkspaceLegalDocumentController;
use App\Http\Controllers\Api\WorkspaceLegalEntityController;
use App\Http\Controllers\Api\WorkspaceApplicationKeyController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use Illuminate\Support\Facades\Http;

Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink'])
    ->middleware('guest')
    ->name('password.email');

Route::post('/reset-password', [ForgotPasswordController::class, 'reset'])
    ->middleware('guest')
    ->name('password.update');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/refresh', [AuthController::class, 'refresh'])->name('auth.refresh');

Route::post('/verify-invitation', [AuthController::class, 'verifyInvitationToken']);
Route::post('/register-by-invitation', [AuthController::class, 'registerByInvitation']);

Route::post('/public/applications', [ApplicationController::class, 'store']);
Route::get('/public/promo-banners', [\App\Http\Controllers\Api\PromoBanners\PublicPromoBannerController::class, 'index']);

// Public roadmap endpoints
Route::get('/public/roadmap/{slug}/tasks', [RoadmapController::class, 'indexPublic']);
Route::get('/public/roadmap/{slug}/manual-statuses', [RoadmapController::class, 'getManualStatuses']);

// Protected routes
Route::middleware(['auth:sanctum', 'workspace.payment'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/checkAdmin', [AuthController::class, 'checkAdmin']);
    Route::post('/user/activity', [AuthController::class, 'updateActivity']);
    Route::get('/workspaces/{workspace}/activities', [ActivityController::class, 'index']);
    Route::post('/workspaces/{workspace}/activities', [ActivityController::class, 'store']);
    Route::post('/workspaces/{workspace}/notifications', [NotificationController::class, 'storeExternal']);
    Route::get('/workspaces/{workspace}/limits-external', [WorkSpaceController::class, 'getLimitsExternal']);
    Route::put('/workspaces/{workspace}/limits-external/sync', [WorkSpaceController::class, 'storeLimitExternal']);
    Route::get('/workspaces/{workspace}/features-external', [WorkSpaceController::class, 'getFeatureExternal']);

    Route::get('/workspaces/{workspace}/profile-info', [AuthController::class, 'getProfileInfo']);

    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/profile/image', [AuthController::class, 'uploadProfileImage']);
    Route::delete('/profile/image', [AuthController::class, 'deleteProfileImage']);

    Route::post('/profile/email/change-request', [AuthController::class, 'requestEmailChange']);
    Route::post('/profile/email/verify', [AuthController::class, 'verifyEmailChange']);
    Route::delete('/profile/email/change-request', [AuthController::class, 'cancelEmailChange']);

    Route::get('/workspaces', [WorkSpaceController::class, 'index']);
    Route::post('/workspaces', [WorkSpaceController::class, 'store']);
    Route::get('/workspaces/{workspace}', [WorkSpaceController::class, 'show'])->middleware('permission:workspaces.view');
    Route::put('/workspaces/{workspace}', [WorkSpaceController::class, 'update'])->middleware('permission:workspaces.edit');
    Route::get('/workspaces/{workspace}/application-keys', [WorkspaceApplicationKeyController::class, 'index']);
    Route::post('/workspaces/{workspace}/application-keys', [WorkspaceApplicationKeyController::class, 'store']);
    Route::delete('/workspaces/{workspace}/application-keys/{applicationKey}', [WorkspaceApplicationKeyController::class, 'destroy']);
    Route::patch('/workspaces/{workspace}/change-type', [WorkSpaceController::class, 'changeType'])->middleware('permission:workspaces.edit');
    Route::get('/workspaces/{workspace}/user-permissions', [WorkSpaceController::class, 'getPermissions']);
    Route::get('/workspaces/{workspace}/limits/{type?}', [WorkSpaceController::class, 'getLimits']);
    Route::get('/workspaces/{workspace}/legal-entity', [WorkspaceLegalEntityController::class, 'show']);
    Route::put('/workspaces/{workspace}/legal-entity', [WorkspaceLegalEntityController::class, 'update']);
    Route::get('/workspaces/{workspace}/legal-documents', [WorkspaceLegalDocumentController::class, 'index']);
    Route::post('/workspaces/{workspace}/legal-documents/generate-contract', [WorkspaceLegalDocumentController::class, 'generateContract']);
    Route::post('/workspaces/{workspace}/legal-documents/generate-invoice', [WorkspaceLegalDocumentController::class, 'generateInvoice']);
    Route::get('/workspaces/{workspace}/legal-documents/{document}/download', [WorkspaceLegalDocumentController::class, 'download']);
    Route::delete('/workspaces/{workspace}/legal-documents/{document}', [WorkspaceLegalDocumentController::class, 'destroy']);

    Route::prefix('workspaces/{workspace}/users')->group(function () {
        Route::get('/', [WorkSpaceController::class, 'indexUsers'])->middleware('permission:users.view');
        Route::post('/invite', [WorkSpaceController::class, 'inviteUsers'])->middleware('permission:users.invite');
        Route::get('/{user}', [WorkSpaceController::class, 'showUser'])->middleware('permission:users.view');
        Route::put('/{user}', [WorkSpaceController::class, 'updateUser'])->middleware('permission:users.edit');
        Route::delete('/{user}', [WorkSpaceController::class, 'removeUser'])->middleware('permission:users.delete');
        
        Route::get('/{user}/permissions', [RoleController::class, 'userPermissions']);
    });

    Route::prefix('workspaces/{workspace}/clients')->group(function () {
        Route::get('/', [ClientController::class, 'index'])->middleware('permission:clients.view');
        Route::post('/', [ClientController::class, 'store'])->middleware('permission:clients.store');
        Route::get('/{client}', [ClientController::class, 'show'])->middleware('permission:clients.view');
        Route::put('/{client}', [ClientController::class, 'update'])->middleware('permission:clients.edit');
        Route::delete('/{client}', [ClientController::class, 'destroy'])->middleware('permission:clients.delete');
    });

    Route::prefix('workspaces/{workspace}/orders')->group(function () {
        Route::post('/', [OrderController::class, 'store'])->name('workspaces.orders.store');
        Route::get('/{order}/status', [OrderController::class, 'showStatus'])->name('workspaces.orders.status');
    });

    Route::prefix('workspaces/{workspace}')->group(function () {
        Route::get('/clients/{client}/projects', [ProjectController::class, 'index'])->middleware('permission:clients.view');
        Route::post('/clients/{client}/projects', [ProjectController::class, 'store'])->middleware('permission:clients.projects.edit');
        Route::get('/projects/{project}', [ProjectController::class, 'show'])->middleware('permission:clients.view');
        Route::put('/projects/{project}', [ProjectController::class, 'update'])->middleware('permission:clients.projects.edit');
        Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->middleware('permission:clients.projects.delete');

        // Roadmap endpoints
        Route::post('/projects/{project}/roadmap/publish', [ProjectController::class, 'publishRoadmap'])->middleware('permission:clients.projects.edit');
        Route::delete('/projects/{project}/roadmap/publish', [ProjectController::class, 'unpublishRoadmap'])->middleware('permission:clients.projects.edit');
        Route::post('/projects/{project}/roadmap/rotate-slug', [ProjectController::class, 'rotateRoadmapSlug'])->middleware('permission:clients.projects.edit');
    });

    Route::prefix('workspaces/{workspace}')->group(function () {
        Route::get('/clients/{client}/contacts', [ContactController::class, 'index'])->middleware('permission:clients.view');
        Route::post('/clients/{client}/contacts', [ContactController::class, 'store'])->middleware('permission:clients.contacts.edit');
        Route::get('/contacts/{contact}', [ContactController::class, 'show'])->middleware('permission:clients.view');
        Route::put('/contacts/{contact}', [ContactController::class, 'update'])->middleware('permission:clients.contacts.edit');
        Route::delete('/contacts/{contact}', [ContactController::class, 'destroy'])->middleware('permission:clients.contacts.delete');
    });

    Route::prefix('workspaces/{workspace}')->group(function () {
        Route::get('/clients/{client}/files', [ClientFileController::class, 'index'])->middleware('permission:clients.view');
        Route::post('/clients/{client}/files', [ClientFileController::class, 'store'])->middleware('permission:clients.files.upload');
        Route::get('/files/{clientFile}/download', [ClientFileController::class, 'download'])->middleware('permission:clients.view');
        Route::get('/files/{clientFile}', [ClientFileController::class, 'show'])->middleware('permission:clients.view');
        Route::put('/files/{clientFile}', [ClientFileController::class, 'update'])->middleware('permission:clients.files.upload');
        Route::delete('/files/{clientFile}', [ClientFileController::class, 'destroy'])->middleware('permission:clients.files.delete');
    });

    Route::prefix('workspaces/{workspace}/tasks')->group(function () {
        Route::get('/', [TaskController::class, 'index'])->middleware('permission:tasks.view|tasks.view.all');
        Route::post('/', [TaskController::class, 'store'])->middleware('permission:tasks.create');
        Route::get('/{task}', [TaskController::class, 'show'])->middleware('permission:tasks.view|tasks.view.all');
        Route::put('/{task}', [TaskController::class, 'update'])->middleware('permission:tasks.edit|tasks.edit.all');
        Route::delete('/{task}', [TaskController::class, 'destroy'])->middleware('permission:tasks.delete');
        
        Route::post('/{task}/images', [TaskController::class, 'uploadFiles'])->middleware('permission:tasks.edit|tasks.edit.all');
    });

    Route::prefix('workspaces/{workspace}/departments')->group(function () {
        Route::get('/', [DepartmentController::class, 'index'])->middleware('permission:departments.view');
        Route::post('/', [DepartmentController::class, 'store'])->middleware('permission:departments.edit');
        Route::get('/{department}', [DepartmentController::class, 'show'])->middleware('permission:departments.view');
        Route::put('/{department}', [DepartmentController::class, 'update'])->middleware('permission:departments.edit');
        Route::delete('/{department}', [DepartmentController::class, 'destroy'])->middleware('permission:departments.delete');
    });

    Route::prefix('workspaces/{workspace}/integrations')->group(function () {
        Route::get('/', [IntegrationController::class, 'index'])->middleware('permission:integrations.view');
        Route::post('/', [IntegrationController::class, 'store'])->middleware('permission:integrations.edit');
        Route::get('/{integration}', [IntegrationController::class, 'show'])->middleware('permission:integrations.view');
        Route::put('/{integration}', [IntegrationController::class, 'update'])->middleware('permission:integrations.edit');
        Route::delete('/{integration}', [IntegrationController::class, 'destroy'])->middleware('permission:integrations.delete');

        Route::get('/{integration}/category', [IntegrationController::class, 'getCategory'])->middleware('permission:integrations.view');
        Route::patch('/{integration}/add-account', [IntegrationController::class, 'addAccount'])->middleware('permission:integrations.edit');

        Route::get('/{integration}/check', [IntegrationController::class, 'check'])->middleware('permission:integrations.view');
    });
    Route::patch('/integrations/{integration}/empty-account', [IntegrationController::class, 'emptyAccount']);
    Route::patch('/integrations/{integration}/confirm-account', [IntegrationController::class, 'confirmAccount']);
    Route::get('/integrations/{integration}/review-limit-external', [ReviewLimitController::class, 'getLimitExternal']);
    Route::put('/integrations/{integration}/review-limit-external/sync', [ReviewLimitController::class, 'storeLimitExternal']);

    Route::get('/get-integrations/{workspace?}', [IntegrationController::class, 'getIntegrations']);
    Route::get('/get-integration/{integration}', [IntegrationController::class, 'getIntegration']);
    Route::get('/check-permission', [PermissionController::class, 'checkPermission']);

    Route::prefix('workspaces/{workspace}/roles')->group(function () {
        Route::get('/', [RoleController::class, 'index'])->middleware('permission:roles.view');
        Route::post('/', [RoleController::class, 'store'])->middleware('permission:roles.edit');
        Route::get('/{role}', [RoleController::class, 'show'])->middleware('permission:roles.view');
        Route::put('/{role}', [RoleController::class, 'update'])->middleware('permission:roles.edit');
        Route::delete('/{role}', [RoleController::class, 'destroy'])->middleware('permission:roles.delete');
    });
    
    Route::get('workspaces/{workspace}/permissions', [PermissionController::class, 'index']);

    Route::prefix('workspaces/{workspace}/news')->group(function () {
        Route::get('/', [NewsController::class, 'index']);
        Route::post('/', [NewsController::class, 'store'])->middleware('permission:news.edit');
        Route::get('/{news}', [NewsController::class, 'show']);
        Route::put('/{news}', [NewsController::class, 'update'])->middleware('permission:news.edit');
        Route::delete('/{news}', [NewsController::class, 'destroy'])->middleware('permission:news.delete');
    });
        
    Route::get('/workspaces/{workspace}/news-info', [NewsController::class, 'info']);

    // News comments routes
    Route::get('workspaces/{workspace}/news/{news}/comments', [NewsCommentController::class, 'index']);
    Route::post('workspaces/{workspace}/news/{news}/comments', [NewsCommentController::class, 'store']);
    Route::get('workspaces/{workspace}/news/{news}/comments/{comment}', [NewsCommentController::class, 'show']);
    Route::put('workspaces/{workspace}/news/{news}/comments/{comment}', [NewsCommentController::class, 'update']);
    Route::delete('workspaces/{workspace}/news/{news}/comments/{comment}', [NewsCommentController::class, 'destroy']);

    // News reactions routes
    Route::get('workspaces/{workspace}/news/{news}/reactions', [NewsReactionController::class, 'index']);
    Route::post('workspaces/{workspace}/news/{news}/reactions/toggle', [NewsReactionController::class, 'toggle']);

    // News comment reactions routes
    Route::get('workspaces/{workspace}/news/{news}/comments/{comment}/reactions', [NewsCommentReactionController::class, 'index']);
    Route::post('workspaces/{workspace}/news/{news}/comments/{comment}/reactions/toggle', [NewsCommentReactionController::class, 'toggle']);

    // News polls routes
    Route::get('workspaces/{workspace}/news/{news}/poll', [NewsPollController::class, 'show']);
    Route::post('workspaces/{workspace}/news/{news}/poll', [NewsPollController::class, 'store']);
    Route::post('workspaces/{workspace}/news/{news}/poll/vote', [NewsPollController::class, 'vote']);
    Route::delete('workspaces/{workspace}/news/{news}/poll/vote', [NewsPollController::class, 'removeVote']);

    Route::get('/news-types', [\App\Http\Controllers\Api\NewsTypeController::class, 'index']);

    Route::get('tasks/{task}/comments', [CommentController::class, 'index']);
    Route::post('tasks/{task}/comments', [CommentController::class, 'store']);
    Route::put('comments/{comment}', [CommentController::class, 'update']);
    Route::patch('comments/{comment}', [CommentController::class, 'update']);
    Route::delete('comments/{comment}', [CommentController::class, 'destroy']);

    Route::get('/collector/integrations', [CollectorController::class, 'getIntegrations']);    
    Route::get('/collector/review-templates', [CollectorController::class, 'getReviewTemplates']);    
    
    Route::get('/workspaces/{workspace}/coordinations', [CoordinationController::class, 'getCoordinations'])->middleware('permission:coordinations.view');
    
    Route::prefix('/workspaces/{workspace}/reviews')->group(function () {
        Route::get('/', [ReviewController::class, 'getReviews'])->middleware('permission:reviews.view');
        Route::post('/respond', [ReviewController::class, 'submitReview'])->middleware('permission:reviews.respond');
    });
    Route::prefix('/workspaces/{workspace}/review-templates')->group(function () {
        Route::get('/', [ReviewTemplateController::class, 'index'])->middleware('permission:review-templates.view');
        Route::post('/', [ReviewTemplateController::class, 'store'])->middleware('permission:review-templates.edit');
        Route::get('/{reviewTemplate}', [ReviewTemplateController::class, 'show'])->middleware('permission:review-templates.view');
        Route::put('/{reviewTemplate}', [ReviewTemplateController::class, 'update'])->middleware('permission:review-templates.edit');
        Route::delete('/{reviewTemplate}', [ReviewTemplateController::class, 'destroy'])->middleware('permission:review-templates.delete');
    });

    Route::prefix('/workspaces/{workspace}/units')->group(function () {
        Route::get('/', [UnitsController::class, 'getUnits'])->middleware('permission:units.view');
        Route::post('/set-self-price', [UnitsController::class, 'setSelfPrice'])->middleware('permission:units.edit');
    });
    
    Route::prefix('/workspaces/{workspace}/applications')->group(function () {
        Route::get('/', [ApplicationController::class, 'index'])->middleware('permission:applications.view');
        Route::get('/{application}', [ApplicationController::class, 'show'])->middleware('permission:applications.view');
    });

    Route::prefix('/workspaces/{workspace}/leads')->group(function () {
        Route::get('/', [LeadController::class, 'index'])->middleware('permission:leads.view');
        Route::post('/', [LeadController::class, 'store'])->middleware('permission:leads.edit');
        Route::get('/{lead}', [LeadController::class, 'show'])->middleware('permission:leads.view');
        Route::put('/{lead}', [LeadController::class, 'update'])->middleware('permission:leads.edit');
        Route::delete('/{lead}', [LeadController::class, 'destroy'])->middleware('permission:leads.delete');

        Route::get('/{lead}/deal-fields', [LeadController::class, 'dealFields'])->middleware('permission:leads.edit');
        Route::put('/{lead}/deal-fields', [LeadController::class, 'updateDealFields'])->middleware('permission:leads.edit');
    });

    Route::prefix('/workspaces/{workspace}/funnel-stages')->group(function () {
        Route::get('/', [FunnelStageController::class, 'index'])->middleware('permission:funnel-stages.view');
        Route::post('/', [FunnelStageController::class, 'store'])->middleware('permission:funnel-stages.edit');
        Route::get('/{funnelStage}', [FunnelStageController::class, 'show'])->middleware('permission:funnel-stages.view');
        Route::put('/{funnelStage}', [FunnelStageController::class, 'update'])->middleware('permission:funnel-stages.edit');
        Route::delete('/{funnelStage}', [FunnelStageController::class, 'destroy'])->middleware('permission:funnel-stages.delete');
        Route::post('/seed-defaults', [FunnelStageController::class, 'seedDefaults'])->middleware('permission:funnel-stages.edit');
    });

    Route::prefix('/workspaces/{workspace}/deal-fields')->group(function () {
        Route::get('/', [DealFieldController::class, 'index'])->middleware('permission:deal-fields.view');
        Route::post('/', [DealFieldController::class, 'store'])->middleware('permission:deal-fields.edit');
        Route::get('/{dealField}', [DealFieldController::class, 'show'])->middleware('permission:deal-fields.view');
        Route::put('/{dealField}', [DealFieldController::class, 'update'])->middleware('permission:deal-fields.edit');
        Route::delete('/{dealField}', [DealFieldController::class, 'destroy'])->middleware('permission:deal-fields.delete');
    });

    //roadmap
    Route::prefix('/workspaces/{workspace}')->group(function () {
        Route::get('/projects/{project}/roadmap/manual-statuses/', [RoadmapController::class, 'getManualStatusesAuth'])->middleware('permission:roadmap.edit');
        Route::post('/projects/{project}/roadmap/manual-statuses/task/{task}', [RoadmapController::class, 'markAsCompleted'])->middleware('permission:roadmap.edit');
        Route::delete('/projects/{project}/roadmap/manual-statuses/task/{task}', [RoadmapController::class, 'removeFromCompleted'])->middleware('permission:roadmap.edit');
        Route::post('/projects/{project}/roadmap/manual-statuses/bulk', [RoadmapController::class, 'bulkSave'])->middleware('permission:roadmap.edit');
        Route::get('/tasks/{task}/subtasks', [TaskSubtaskController::class, 'index'])->middleware('permission:tasks.view|tasks.view.all');
        Route::post('/tasks/{task}/subtasks', [TaskSubtaskController::class, 'store'])->middleware('permission:tasks.edit|tasks.edit.all');
        Route::post('/tasks/{task}/subtasks/generate', [TaskSubtaskController::class, 'generate'])->middleware('permission:tasks.edit|tasks.edit.all');
        Route::patch('/subtasks/{subtask}', [TaskSubtaskController::class, 'update'])->middleware('permission:tasks.edit|tasks.edit.all');
        Route::delete('/subtasks/{subtask}', [TaskSubtaskController::class, 'destroy'])->middleware('permission:tasks.edit|tasks.edit.all');
        Route::post('/projects/{project}/tasks/generate-subtasks', [TaskSubtaskController::class, 'bulkGenerate'])->middleware('permission:roadmap.edit');
    });

    //notifications
    Route::prefix('/notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::get('/{notification}', [NotificationController::class, 'show']);
        Route::patch('/{notification}/read', [NotificationController::class, 'markRead']);
        Route::patch('/read-all', [NotificationController::class, 'markAllRead']);
        Route::delete('/{notification}', [NotificationController::class, 'destroy']);
        Route::delete('/', [NotificationController::class, 'destroyAll']);
    });

    //api/notification-preferences
    Route::prefix('/notification-preferences')->group(function () {
        Route::get('/', [NotificationPreferenceController::class, 'index']);
        Route::put('/', [NotificationPreferenceController::class, 'update']);
        Route::post('/test-telegram', [NotificationPreferenceController::class, 'testTelegram']);
    });

    Route::prefix('/workspaces/{workspace}/support/tickets')->group(function () {
        Route::get('/unread-count', [SupportTicketController::class, 'unreadCount']);
        Route::get('/', [SupportTicketController::class, 'index']);
        Route::post('/', [SupportTicketController::class, 'store']);
        Route::get('/{id}', [SupportTicketController::class, 'show']);
        Route::patch('/{id}', [SupportTicketController::class, 'update']);
        Route::post('/{id}/reopen', [SupportTicketController::class, 'reopen']);
        Route::get('/{id}/messages', [SupportTicketController::class, 'messages']);
        Route::post('/{id}/messages', [SupportTicketController::class, 'sendMessage']);
    });
});

// РђРІС‚РѕСЂРёР·Р°С†РёСЏ С‡РµСЂРµР· РЇРЅРґРµРєСЃ OAuth
Route::prefix('auth')->group(function () {
    // РџРѕР»СѓС‡РёС‚СЊ URL РґР»СЏ Р°РІС‚РѕСЂРёР·Р°С†РёРё (JSON РѕС‚РІРµС‚)
    Route::get('yandex/url', [AuthController::class, 'getAuthUrl'])->name('auth.yandex.url');
    
    // Р РµРґРёСЂРµРєС‚ РЅР° СЃС‚СЂР°РЅРёС†Сѓ Р°РІС‚РѕСЂРёР·Р°С†РёРё РЇРЅРґРµРєСЃР°
    Route::get('yandex', [AuthController::class, 'redirectToYandex'])->name('auth.yandex');
    
    // РћР±РјРµРЅСЏС‚СЊ РєРѕРґ РЅР° С‚РѕРєРµРЅ (Device Flow - РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РІРІРѕРґРёС‚ РєРѕРґ)
    Route::post('yandex/exchange', [AuthController::class, 'exchangeCode'])->name('auth.yandex.exchange');
    
    // Legacy callback (РґР»СЏ СЃРѕРІРјРµСЃС‚РёРјРѕСЃС‚Рё)
    Route::get('yandex/callback', [AuthController::class, 'handleYandexCallback'])->name('auth.yandex.callback');
});

// Р—Р°С‰РёС‰С‘РЅРЅС‹Рµ РјР°СЂС€СЂСѓС‚С‹ (С‚СЂРµР±СѓСЋС‚ Р°РІС‚РѕСЂРёР·Р°С†РёРё)
Route::middleware('auth:sanctum')->group(function () {
    
    // РРЅС„РѕСЂРјР°С†РёСЏ Рѕ С‚РµРєСѓС‰РµРј РїРѕР»СЊР·РѕРІР°С‚РµР»Рµ
    Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');
    
    // CRUD РѕРїРµСЂР°С†РёРё СЃРѕ РІСЃС‚СЂРµС‡Р°РјРё
    Route::apiResource('meetings', MeetingController::class);
    
    // Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Рµ РґРµР№СЃС‚РІРёСЏ СЃРѕ РІСЃС‚СЂРµС‡Р°РјРё
    Route::prefix('meetings/{meeting}')->group(function () {
        // РЎРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ СЃ РўРµР»РµРјРѕСЃС‚РѕРј
        Route::post('sync', [MeetingController::class, 'sync'])->name('meetings.sync');
        
        // РЈРїСЂР°РІР»РµРЅРёРµ СЃРѕРѕСЂРіР°РЅРёР·Р°С‚РѕСЂР°РјРё
        Route::post('cohosts', [MeetingController::class, 'addCohosts'])->name('meetings.cohosts.add');
        Route::delete('cohosts', [MeetingController::class, 'removeCohosts'])->name('meetings.cohosts.remove');
        
        // РЈРїСЂР°РІР»РµРЅРёРµ СЃС‚Р°С‚СѓСЃРѕРј РІСЃС‚СЂРµС‡Рё
        Route::post('start', [MeetingController::class, 'start'])->name('meetings.start');
        Route::post('end', [MeetingController::class, 'end'])->name('meetings.end');
    });
});

// РџСѓР±Р»РёС‡РЅС‹Р№ СЌРЅРґРїРѕРёРЅС‚ РґР»СЏ Р±С‹СЃС‚СЂРѕРіРѕ СЃРѕР·РґР°РЅРёСЏ РІСЃС‚СЂРµС‡Рё Telemost (Р±РµР· Р°РІС‚РѕСЂРёР·Р°С†РёРё)
Route::post('meetings/instant', [MeetingController::class, 'store'])
    ->name('meetings.instant')
    ->middleware('throttle:10,1'); // РћРіСЂР°РЅРёС‡РµРЅРёРµ: 10 Р·Р°РїСЂРѕСЃРѕРІ РІ РјРёРЅСѓС‚Сѓ

// ============================================
// Jitsi Meet API
// ============================================

// РџСѓР±Р»РёС‡РЅС‹Рµ СЌРЅРґРїРѕРёРЅС‚С‹ Jitsi
Route::prefix('jitsi')->group(function () {
    // GET /api/v1/jitsi/config - РљРѕРЅС„РёРіСѓСЂР°С†РёСЏ Jitsi
    Route::get('config', [JitsiController::class, 'config'])->name('jitsi.config');
    
    // POST /api/v1/jitsi/meetings/instant - Р‘С‹СЃС‚СЂРѕРµ СЃРѕР·РґР°РЅРёРµ РІСЃС‚СЂРµС‡Рё (Р±РµР· Р°РІС‚РѕСЂРёР·Р°С†РёРё)
    Route::post('meetings/instant', [JitsiController::class, 'instant'])
        ->name('jitsi.meetings.instant')
        ->middleware('throttle:30,1'); // 30 Р·Р°РїСЂРѕСЃРѕРІ РІ РјРёРЅСѓС‚Сѓ
});

Route::middleware('auth:sanctum')->prefix('jitsi')->group(function () {
    // CRUD РѕРїРµСЂР°С†РёРё СЃ Jitsi РІСЃС‚СЂРµС‡Р°РјРё
    Route::apiResource('meetings', JitsiController::class)->names([
        'index' => 'jitsi.meetings.index',
        'store' => 'jitsi.meetings.store',
        'show' => 'jitsi.meetings.show',
        'update' => 'jitsi.meetings.update',
        'destroy' => 'jitsi.meetings.destroy',
    ]);
    
    // Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Рµ РґРµР№СЃС‚РІРёСЏ СЃ Jitsi РІСЃС‚СЂРµС‡Р°РјРё
    Route::prefix('meetings/{meeting}')->group(function () {
        // РџРѕР»СѓС‡РёС‚СЊ С‚РѕРєРµРЅ РґР»СЏ СѓС‡Р°СЃС‚РЅРёРєР°
        Route::post('token', [JitsiController::class, 'getParticipantToken'])
            ->name('jitsi.meetings.token');
        
        // РџРѕР»СѓС‡РёС‚СЊ РєРѕРґ РґР»СЏ РІСЃС‚СЂР°РёРІР°РЅРёСЏ
        Route::get('embed', [JitsiController::class, 'getEmbedCode'])
            ->name('jitsi.meetings.embed');
        
        // Р—Р°РєСЂС‹С‚СЊ РІСЃС‚СЂРµС‡Сѓ
        Route::post('close', [JitsiController::class, 'close'])
            ->name('jitsi.meetings.close');
        
        // РЎРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°С‚СЊ РґР°РЅРЅС‹Рµ
        Route::post('sync', [JitsiController::class, 'sync'])
            ->name('jitsi.meetings.sync');
    });
});

Route::middleware(['auth:sanctum', 'workspace.payment'])->prefix('chat')->group(function () {
    Route::prefix('/workspaces/{workspace}')->group(function () {
        Route::get('/rooms', [ChatController::class, 'getChatRooms']);
        Route::post('/rooms', [ChatController::class, 'createChatRoom']);
        Route::post('/rooms/{chatRoom}/participants', [ChatController::class, 'addUser']);
        Route::get('/unread-count', [ChatController::class, 'getUnreadMessagesCount']);
        Route::post('/support/tickets', [ChatController::class, 'createSupportTicket']);
        Route::post('/meet-invitations', [MeetInvitationController::class, 'store']);
    });

    Route::post('/meet-invitations/{meetingId}/accept', [MeetInvitationController::class, 'accept']);
    Route::post('/meet-invitations/{meetingId}/decline', [MeetInvitationController::class, 'decline']);

    Route::get('/rooms/{chatRoom}', [ChatController::class, 'getMessages']);
    Route::post('/rooms/{chatRoom}/messages', [ChatController::class, 'sendMessage']);
    Route::put('/rooms/{chatRoom}/messages/{message}', [ChatController::class, 'updateMessage']);
    Route::delete('/rooms/{chatRoom}/messages/{message}', [ChatController::class, 'deleteMessage']);
    Route::get('/rooms/{chatRoom}/search', [ChatController::class, 'searchMessages']);
    Route::post('/rooms/{chatRoom}/messages/{message}/reactions', [ChatController::class, 'toggleReaction']);
    Route::post('/rooms/{chatRoom}/messages/{message}/pin', [ChatController::class, 'pinMessage']);
    Route::delete('/rooms/{chatRoom}/messages/{message}/pin', [ChatController::class, 'unpinMessage']);
    Route::get('/rooms/{chatRoom}/pinned', [ChatController::class, 'getPinnedMessages']);
    Route::post('/rooms/{chatRoom}/polls', [ChatController::class, 'createPoll']);
    Route::post('/rooms/{chatRoom}/polls/{poll}/vote', [ChatController::class, 'votePoll']);
    Route::get('/search', [ChatController::class, 'searchAllChats']);

    Route::post('/rooms/{chatRoom}/typing/send', [ChatController::class, 'sendTyping']);
    Route::post('/rooms/{chatRoom}/typing', [ChatController::class, 'setTypingStatus']);

    Route::get('/rooms/{chatRoom}/participants', [ChatController::class, 'getParticipants']);
    Route::delete('/rooms/{chatRoom}/participants/{user}', [ChatController::class, 'removeUser']);
    Route::post('/rooms/{chatRoom}/participants/{user}/make-admin', [ChatController::class, 'makeAdmin']);
    Route::post('/rooms/{chatRoom}/leave', [ChatController::class, 'leaveChat']);

    Route::post('/rooms/{chatRoom}/mark-as-read', [ChatController::class, 'markAsRead']);
    Route::get('/rooms/{chatRoom}/unread-count', [ChatController::class, 'getUnreadCount']);
});

require __DIR__.'/admin.php';
