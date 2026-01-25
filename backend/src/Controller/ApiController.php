<?php

namespace App\Controller;

use App\Service\FifoCalculator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class ApiController extends AbstractController
{
    #[Route('/api/calculate', name: 'api_calculate', methods: ['POST'])]
    public function calculate(Request $request): JsonResponse
    {
        $fifo = new FifoCalculator();

        $data = json_decode($request->getContent(), true);

        if (!isset($data['transactions']) || !is_array($data['transactions'])) {
            return $this->json([
                'error' => 'Invalid input: transactions array is required'
            ], 400);
        }

        $transactions = $data['transactions'];
        $processed = [];

        foreach ($transactions as $i => $tx) {
            try {
                // Defensive: process each transaction
                $disposal = $fifo->processTransaction($tx)['disposal'];
                $processed[] = [
                    'transaction' => $tx,
                    'disposal' => $disposal
                ];
            } catch (\Exception $e) {
                // If one transaction fails, include error info but continue
                $processed[] = [
                    'transaction' => $tx,
                    'disposal' => null,
                    'error' => $e->getMessage()
                ];
            }
        }

        return $this->json([
            'processedTransactions' => $processed,
            'finalBalances' => $fifo->getBalances()
        ]);
    }
}
