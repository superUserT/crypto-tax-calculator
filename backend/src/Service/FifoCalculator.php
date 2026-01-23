<?php
namespace App\Service;

// Simple FIFO calculator class 
class FifoCalculator
{
    private $balances = [];

    public function getBalances(): array
    {
        return $this->balances;
    }

    private function addLot(string $coin, float $amount, float $pricePerCoin, string $date)
    {
        if (!isset($this->balances[$coin])) {
            $this->balances[$coin] = [
                'totalAmount' => 0,
                'lots' => []
            ];
        }

        $this->balances[$coin]['lots'][] = [
            'amount' => $amount,
            'pricePerCoin' => $pricePerCoin,
            'date' => $date
        ];

        $this->balances[$coin]['totalAmount'] += $amount;
    }

    private function sell(string $coin, float $sellAmount, float $pricePerCoin, string $date): array
    {
        if (!isset($this->balances[$coin])) {
            throw new \Exception("No balance for coin $coin");
        }

        $remaining = $sellAmount;
        $cost = 0;
        $consumedLots = [];

        foreach ($this->balances[$coin]['lots'] as &$lot) {
            if ($remaining <= 0) break;

            $take = min($lot['amount'], $remaining);
            $cost += $take * $lot['pricePerCoin'];

            $consumedLots[] = [
                'amount' => $take,
                'pricePerCoin' => $lot['pricePerCoin'],
                'date' => $lot['date']
            ];

            $lot['amount'] -= $take;
            $remaining -= $take;
        }

        // Remove fully consumed lots
        $this->balances[$coin]['lots'] = array_filter(
            $this->balances[$coin]['lots'],
            fn($lot) => $lot['amount'] > 0
        );

        $this->balances[$coin]['totalAmount'] -= ($sellAmount - $remaining);

        $proceeds = $sellAmount * $pricePerCoin;
        $gain = $proceeds - $cost;

        return [
            'disposedAmount' => $sellAmount - $remaining,
            'cost' => $cost,
            'proceeds' => $proceeds,
            'gain' => $gain,
            'consumedLots' => $consumedLots
        ];
    }

    // inside FifoCalculator::processTransaction
    public function processTransaction(array $tx): array
    {
        // Normalize inputs
        $type = isset($tx['type']) ? strtoupper($tx['type']) : 'BUY';
        $date = $tx['date'] ?? date('Y-m-d H:i:s');
        $buyAmount = floatval($tx['buyAmount'] ?? 0);
        $sellAmount = floatval($tx['sellAmount'] ?? 0);
        $buyPricePerCoin = floatval($tx['buyPricePerCoin'] ?? 0);
        $buyCoin = $tx['buyCoin'] ?? null;
        $sellCoin = $tx['sellCoin'] ?? null;

        try {
            if ($type === 'BUY') {
                $buyCoin = $buyCoin ?: 'UNKNOWN';
                $this->addLot($buyCoin, $buyAmount, $buyPricePerCoin, $date);
                return ['disposal' => null];
            }

            if ($type === 'SELL') {
                $sellCoin = $sellCoin ?: 'UNKNOWN';
                return ['disposal' => $this->sell($sellCoin, $sellAmount, $buyPricePerCoin, $date)];
            }

            if ($type === 'TRADE') {
                $buyCoin = $buyCoin ?: 'UNKNOWN';
                $sellCoin = $sellCoin ?: 'UNKNOWN';
                $sellResult = $this->sell($sellCoin, $sellAmount, $buyPricePerCoin, $date);
                $this->addLot($buyCoin, $buyAmount, $buyPricePerCoin, $date);
                return ['disposal' => $sellResult];
            }

            return ['disposal' => null];
        } catch (\Exception $e) {
            // Instead of breaking, return a disposal with zeros
            return [
                'disposal' => [
                    'disposedAmount' => 0,
                    'cost' => 0,
                    'proceeds' => 0,
                    'gain' => 0,
                    'consumedLots' => [],
                    'error' => $e->getMessage()
                ]
            ];
        }
    }


}
