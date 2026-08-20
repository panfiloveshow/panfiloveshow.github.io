<?php

namespace App\Services\Payments\Alfa;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;

class AlfaPaymentService
{
    private string $baseUrl;
    private ?string $userName;
    private ?string $password;
    private ?string $token;
    private int $timeout;
    private string|bool $caBundle;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.alfa_payment.base_url'), '/');
        $this->userName = config('services.alfa_payment.user_name');
        $this->password = config('services.alfa_payment.password');
        $this->token = config('services.alfa_payment.token');
        $this->timeout = (int) config('services.alfa_payment.timeout', 15);

        // Кастомный CA-бандл: шлюз Альфы работает на сертификатах НУЦ Минцифры,
        // которых нет в системном хранилище — без бандла TLS-рукопожатие падает.
        $caBundle = (string) config('services.alfa_payment.ca_bundle');
        $this->caBundle = ($caBundle !== '' && is_file($caBundle)) ? $caBundle : true;
    }

    /**
     * Register a one-stage payment order and receive a bank payment page URL.
     */
    public function registerOrder(array $data): array
    {
        $payload = $this->prepareRegisterPayload($data);

        return $this->post('register.do', $payload);
    }

    /**
     * Get a payment order status by Alfa payment gateway order id.
     */
    public function getOrderStatus(array $data): array
    {
        $payload = $this->prepareOrderStatusPayload($data);

        return $this->post('getOrderStatus.do', $payload);
    }

    private function prepareRegisterPayload(array $data): array
    {
        $required = ['orderNumber', 'amount'];

        foreach ($required as $field) {
            if (!array_key_exists($field, $data) || $data[$field] === null || $data[$field] === '') {
                throw new InvalidArgumentException("{$field} is required.");
            }
        }

        if (mb_strlen((string) $data['orderNumber']) > 36) {
            throw new InvalidArgumentException('orderNumber must not be greater than 36 characters.');
        }

        if ((int) $data['amount'] <= 0) {
            throw new InvalidArgumentException('amount must be greater than 0.');
        }

        //$returnUrl = $data['returnUrl'] ?? config('services.alfa_payment.return_url');
        $returnUrl = config('services.alfa_payment.return_url') . "&payment_workspace=" . $data['workspace'] . "&order_id=" . $data['orderNumber'] . "&utm_source=alfa&utm_medium=return&utm_campaign=alfa_payment";

        if (!$returnUrl) {
            throw new InvalidArgumentException('returnUrl is required.');
        }

        $payload = [
            'orderNumber' => (string) $data['orderNumber'],
            'amount' => (int) $data['amount'],
            'returnUrl' => $returnUrl,
        ];

        $optionalFields = [
            'currency',
            'failUrl',
            'description',
            'language',
            'pageView',
            'clientId',
            'merchantLogin',
            'jsonParams',
            'sessionTimeoutSecs',
            'expirationDate',
            'features',
            'email',
            'phone',
            'orderBundle',
        ];

        foreach ($optionalFields as $field) {
            if (!array_key_exists($field, $data) || $data[$field] === null || $data[$field] === '') {
                continue;
            }

            $payload[$field] = is_array($data[$field])
                ? json_encode($data[$field], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
                : $data[$field];
        }

        if (!isset($payload['currency']) && config('services.alfa_payment.currency')) {
            $payload['currency'] = config('services.alfa_payment.currency');
        }

        if (!isset($payload['failUrl'])) {
            // Отдельный failUrl (payment=fail) — иначе отменённая оплата возвращает
            // пользователя на payment=return и фронт показывает «Проверяем оплату»
            $configuredFailUrl = (string) config('services.alfa_payment.fail_url');
            $payload['failUrl'] = $configuredFailUrl !== ''
                ? $configuredFailUrl . "&payment_workspace=" . ($data['workspace'] ?? '') . "&order_id=" . $data['orderNumber'] . "&utm_source=alfa&utm_medium=fail&utm_campaign=alfa_payment"
                : $returnUrl;
        }

        return $payload;
    }

    private function prepareOrderStatusPayload(array $data): array
    {
        $orderId = $data['orderId'] ?? $data['order_id'] ?? null;

        if ($orderId === null || $orderId === '') {
            throw new InvalidArgumentException('orderId is required.');
        }

        if (mb_strlen((string) $orderId) > 36) {
            throw new InvalidArgumentException('orderId must not be greater than 36 characters.');
        }

        $payload = [
            'orderId' => (string) $orderId,
        ];

        if (array_key_exists('language', $data) && $data['language'] !== null && $data['language'] !== '') {
            if (mb_strlen((string) $data['language']) !== 2) {
                throw new InvalidArgumentException('language must be 2 characters.');
            }

            $payload['language'] = (string) $data['language'];
        }

        return $payload;
    }

    private function post(string $method, array $payload): array
    {
        if (!$this->baseUrl) {
            throw new AlfaPaymentException('Alfa payment base URL is not configured.');
        }

        $payload = array_merge($this->authPayload(), $payload);

        try {
            $response = Http::asForm()
                ->acceptJson()
                ->timeout($this->timeout)
                ->withOptions(['verify' => $this->caBundle])
                ->post($this->url($method), $payload)
                ->throw();
        } catch (ConnectionException $exception) {
            throw new AlfaPaymentException(
                'Failed to connect to Alfa payment gateway: ' . $exception->getMessage(),
                previous: $exception
            );
        } catch (RequestException $exception) {
            $body = $exception->response?->json() ?? [];

            throw new AlfaPaymentException(
                $body['errorMessage'] ?? $body['ErrorMessage'] ?? $exception->getMessage(),
                $body['errorCode'] ?? $body['ErrorCode'] ?? null,
                $body,
                $exception->response?->status() ?? 0,
                $exception
            );
        }

        $data = $response->json() ?? [];
        $this->throwIfGatewayError($data);

        return $data;
    }

    private function authPayload(): array
    {
        if ($this->token) {
            return ['token' => $this->token];
        }

        if (!$this->userName || !$this->password) {
            throw new AlfaPaymentException('Alfa payment credentials are not configured.');
        }

        return [
            'userName' => $this->userName,
            'password' => $this->password,
        ];
    }

    private function throwIfGatewayError(array $data): void
    {
        $errorCode = $data['errorCode'] ?? $data['ErrorCode'] ?? null;

        if ($errorCode === null || (string) $errorCode === '0') {
            return;
        }

        throw new AlfaPaymentException(
            $data['errorMessage'] ?? $data['ErrorMessage'] ?? 'Alfa payment gateway returned an error.',
            $errorCode,
            $data
        );
    }

    private function url(string $method): string
    {
        return $this->baseUrl . '/' . ltrim($method, '/');
    }
}
