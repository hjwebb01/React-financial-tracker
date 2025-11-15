import { useEffect, useMemo, useState } from "react";
import { sampleTransactions } from "../sampleData";
import { sumInt32 } from "../wasm/financeWasm";

function DashboardPage() {
  const formatMoney = (amountCents: number) => (amountCents / 100).toFixed(2);

  const [totalCentsFromWasm, setTotalCentsFromWasm] = useState<number | null>(
    null
  );
  const [isLoadingTotal, setIsLoadingTotal] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const amountsInt32 = useMemo(
    () => new Int32Array(sampleTransactions.map((tx) => tx.amountCents)),
    []
  );

  const sumCentsJs = (values: Int32Array): number => {
    let total = 0;
    for (let i = 0; i < values.length; i++) {
      total += values[i];
    }
    return total;
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoadingTotal(true);
      setLoadError(null);
      try {
        // Quick WASM sanity check: sumInt32([1,2,3]) should be 6
        try {
          const testResult = await sumInt32(new Int32Array([1, 2, 3]));
          console.log("WASM test sumInt32([1,2,3]) =", testResult);
        } catch (testErr) {
          console.error("WASM test sumInt32([1,2,3]) failed", testErr);
        }

        const result = await sumInt32(amountsInt32);
        if (!cancelled) {
          setTotalCentsFromWasm(result);
        }
      } catch (err) {
        console.error("WASM sumInt32 failed, falling back to JS sum", err);
        const fallback = sumCentsJs(amountsInt32);
        if (!cancelled) {
          setTotalCentsFromWasm(fallback);
          setLoadError(
            "Could not load WASM backend, using JS fallback for totals."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTotal(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [amountsInt32]);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Dashboard (WASM-powered insights coming soon!)</p>
      <p>Number of transactions: {sampleTransactions.length}</p>
      <p>Sample transactions:</p>
      <ul>
        {sampleTransactions.map((transaction) => (
          <li key={transaction.id}>
            {transaction.date} - {transaction.description} -{" "}
            {transaction.category} - ${formatMoney(transaction.amountCents)}
          </li>
        ))}
      </ul>

      <hr />

      <h3>Total from WASM</h3>
      {isLoadingTotal && <p>Calculating total via WASM…</p>}
      {!isLoadingTotal && loadError && <p>{loadError}</p>}
      {!isLoadingTotal && totalCentsFromWasm !== null && (
        <p>
          Total spent (WASM or fallback): ${formatMoney(totalCentsFromWasm)}
        </p>
      )}
    </div>
  );
}
export default DashboardPage;
