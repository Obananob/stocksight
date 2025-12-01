import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";
import { ClipboardList, DollarSign, AlertCircle, CheckCircle } from "lucide-react";

interface ReconciliationRecord {
  id: string;
  date: string;
  expected_cash: number;
  cash_received: number;
  status: string;
  notes: string | null;
}

const Reconciliation = () => {
  const { formatCurrency, getCurrencyInfo } = useSettings();
  const [records, setRecords] = useState<ReconciliationRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedCash, setExpectedCash] = useState("0");
  const [cashReceived, setCashReceived] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
    calculateExpectedCash();
  }, [selectedDate]);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("reconciliation")
      .select("*")
      .order("date", { ascending: false })
      .limit(10);

    if (error) {
      toast.error("Failed to load reconciliation records");
      return;
    }

    setRecords(data || []);
  };

  const calculateExpectedCash = async () => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("sales")
      .select("total_price")
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString());

    if (error) {
      console.error("Failed to calculate expected cash:", error);
      return;
    }

    const total = data?.reduce((sum, sale) => sum + sale.total_price, 0) || 0;
    setExpectedCash(total.toFixed(2));
  };

  const handleSubmit = async () => {
    if (!cashReceived) {
      toast.error("Please enter the cash received amount");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const expectedAmount = parseFloat(expectedCash);
      const receivedAmount = parseFloat(cashReceived);
      const discrepancy = Math.abs(expectedAmount - receivedAmount);
      const status = discrepancy > 0.01 ? "disputed" : "approved";

      const { error } = await supabase.from("reconciliation").insert({
        owner_id: user.id,
        date: selectedDate,
        expected_cash: expectedAmount,
        cash_received: receivedAmount,
        status,
        notes,
      });

      if (error) throw error;

      toast.success("Reconciliation record saved!");
      setCashReceived("");
      setNotes("");
      fetchRecords();
    } catch (error: any) {
      toast.error(error.message || "Failed to save reconciliation");
    } finally {
      setIsLoading(false);
    }
  };

  const currencySymbol = getCurrencyInfo().symbol;
  const discrepancy = cashReceived
    ? parseFloat(expectedCash) - parseFloat(cashReceived)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <ClipboardList className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cash Reconciliation</h1>
          <p className="text-muted-foreground">Verify daily cash collections</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">New Reconciliation</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="p-4 rounded-lg bg-accent">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="font-semibold">Expected Cash</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(parseFloat(expectedCash))}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Based on sales for {selectedDate}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cashReceived">Cash Received ({currencySymbol})</Label>
            <Input
              id="cashReceived"
              type="number"
              step="0.01"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              placeholder="Enter actual cash received"
            />
          </div>

          {cashReceived && (
            <div
              className={`p-4 rounded-lg border-2 ${
                Math.abs(discrepancy) > 0.01
                  ? "bg-destructive/10 border-destructive"
                  : "bg-primary/10 border-primary"
              }`}
            >
              <div className="flex items-center gap-2">
                {Math.abs(discrepancy) > 0.01 ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
                <span className="font-semibold">
                  {Math.abs(discrepancy) > 0.01 ? "Discrepancy Detected" : "Perfect Match!"}
                </span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(Math.abs(discrepancy))} {discrepancy > 0 ? "Short" : discrepancy < 0 ? "Over" : ""}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this reconciliation..."
              rows={3}
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading || !cashReceived}
          >
            {isLoading ? "Saving..." : "Submit Reconciliation"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Reconciliations</h3>
        <div className="space-y-3">
          {records.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No records yet</p>
          ) : (
            records.map((record) => {
              const diff = record.expected_cash - record.cash_received;
              return (
                <div key={record.id} className="p-4 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{new Date(record.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        Expected: {formatCurrency(record.expected_cash)} | Received: {formatCurrency(record.cash_received)}
                      </p>
                      {record.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          record.status === "approved"
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {record.status}
                      </span>
                      {Math.abs(diff) > 0.01 && (
                        <p className="text-sm font-semibold mt-1">
                          {formatCurrency(Math.abs(diff))} {diff > 0 ? "Short" : "Over"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reconciliation;
