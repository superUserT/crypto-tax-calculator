<?php
namespace App\Service;

class FifoCalculator
{
    private $balances = [];

    public function getBalances(): array
    {
        return $this->balances;
    }

    private function addLot(string $coin, float $amount, float $price, string $date)
    {
        if (!isset($this->balances[$coin])) {
            $this->balances[$coin] = [
                'totalAmount' => 0,
                'lots' => []
            ];
        }

        $this->balances[$coin]['lots'][] = [
            'amount' => $amount,
            'pricePerCoin' => $price,
            'date' => $date
        ];

        $this->balances[$coin]['totalAmount'] += $amount;
    }

    private function fifoSell(string $coin, float $amount): array
    {
        if (!isset($this->balances[$coin])) {
            throw new \Exception("No balance for $coin");
        }

        $remaining = $amount;
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

        if ($remaining > 0) {
            throw new \Exception("Insufficient balance for $coin");
        }

        $this->balances[$coin]['lots'] = array_values(
            array_filter($this->balances[$coin]['lots'], fn($l) => $l['amount'] > 0)
        );

        $this->balances[$coin]['totalAmount'] -= $amount;

        return [$cost, $consumedLots];
    }

    public function processTransaction(array $tx): array
    {
        $type = strtoupper($tx['type'] ?? '');
        $date = $tx['date'] ?? date('Y-m-d');

        if ($type === 'BUY') {
            $this->addLot(
                $tx['buyCoin'],
                (float)$tx['buyAmount'],
                (float)$tx['buyPricePerCoin'],
                $date
            );
            return ['disposal' => null];
        }

        if ($type === 'TRADE') {
            // SARS rule:
            // proceeds = value of asset received
            $proceeds = $tx['buyAmount'] * $tx['buyPricePerCoin'];

            // BTC sold = proceeds / BTC market price
            $sellAmount = $proceeds / $tx['sellPricePerCoin'];

            [$cost, $lots] = $this->fifoSell($tx['sellCoin'], $sellAmount);

            $this->addLot(
                $tx['buyCoin'],
                (float)$tx['buyAmount'],
                (float)$tx['buyPricePerCoin'],
                $date
            );

            return [
                'disposal' => [
                    'disposedAmount' => $sellAmount,
                    'cost' => $cost,
                    'proceeds' => $proceeds,
                    'gain' => $proceeds - $cost,
                    'consumedLots' => $lots
                ]
            ];
        }

        if ($type === 'SELL') {
            // Ensure we have sellCoin, sellAmount, and sellPricePerCoin
            $sellCoin = $tx['sellCoin'] ?? null;
            $sellAmount = isset($tx['sellAmount']) ? (float)$tx['sellAmount'] : 0;
            $sellPricePerCoin = isset($tx['sellPricePerCoin']) ? (float)$tx['sellPricePerCoin'] : 0;

            if (!$sellCoin || $sellAmount <= 0 || $sellPricePerCoin <= 0) {
                return ['disposal' => null]; // invalid SELL
            }

            // Perform FIFO sale
            [$cost, $lots] = $this->fifoSell($sellCoin, $sellAmount);

            // Calculate proceeds and gain
            $proceeds = $sellAmount * $sellPricePerCoin;
            $gain = $proceeds - $cost;

            return [
                'disposal' => [
                    'disposedAmount' => $sellAmount,
                    'cost' => $cost,
                    'proceeds' => $proceeds,
                    'gain' => $gain,
                    'consumedLots' => $lots
                ]
            ];
        }


        return ['disposal' => null];
    }
}
