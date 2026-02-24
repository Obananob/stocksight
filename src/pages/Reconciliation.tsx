import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/hooks/useAuth";
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
  const { formatCurrency, getCurrencyInfo, t } = useSettings();
  const { user, ownerId } = useAuth();
  const [records, setRecords] = useState<ReconciliationRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedCash, setExpectedCash] = useState("0");
  const [cashReceived, setCashReceived] = useState("");
  const [isPartial, setIsPartial] = useState(false);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (ownerId) {
      fetchRecords();
      calculateExpectedCash();
    }
  }, [selectedDate, ownerId]);

  const fetchRecords = async () => {
    if (!ownerId) return;
    const { data, error } = await supabase
      .from("reconciliation")
      .select("*")
      .eq("owner_id", ownerId)
      .order("date", { ascending: false })
      .limit(10);

    if (error) {
      toast.error("Failed to load reconciliation records");
      return;
    }

    setRecords(data || []);
  };

  const calculateExpectedCash = async () => {
    if (!ownerId) return;

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get team member IDs including owner to scope sales
    const { data: teamMembers } = await supabase
      .from("user_roles")
      .select("user_id")
      .or(`owner_id.eq.${ownerId},user_id.eq.${ownerId}`);

    const teamIds = teamMembers?.map(m => m.user_id) || [ownerId];

    // Get total sales for the day from the entire team
    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select("total_price")
      .in("user_id", teamIds)
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString());

    if (salesError) {
      console.error("Failed to fetch sales for calculation:", salesError);
      return;
    }

    // Get existing reconciliation for the day for this owner
    const { data: reconData, error: reconError } = await supabase
      .from("reconciliation")
      .select("expected_cash")
      .eq("owner_id", ownerId)
      .eq("date", selectedDate);

    if (reconError) {
      console.error("Failed to fetch reconciliation for calculation:", reconError);
      return;
    }

    const totalSales = salesData?.reduce((sum, sale) => sum + Number(sale.total_price), 0) || 0;
    const reconciledAmount = reconData?.reduce((sum, record) => sum + Number(record.expected_cash), 0) || 0;

    const remainingExpected = Math.max(0, totalSales - reconciledAmount);
    setExpectedCash(remainingExpected.toFixed(2));
  };

  const handleSubmit = async () => {
    if (!cashReceived) {
      toast.error("Please enter the cash received amount");
      return;
    }

    setIsLoading(true);

    try {
      if (!user || !ownerId) throw new Error("Not authenticated");

      const receivedAmount = parseFloat(cashReceived);
      // If partial, the amount we're reconciling against is what we actually found.
      // This leaves the remaining sales pool "unreconciled" for later.
      const expectedAmount = isPartial ? receivedAmount : parseFloat(expectedCash);

      const discrepancy = Math.abs(expectedAmount - receivedAmount);
      const status = isPartial ? "approved" : (discrepancy > 0.01 ? "disputed" : "approved");

      const { error } = await supabase.from("reconciliation").insert({
        owner_id: ownerId,
        date: selectedDate,
        expected_cash: expectedAmount,
        cash_received: receivedAmount,
        status,
        notes: isPartial ? `[Partial Count] ${notes}`.trim() : notes,
      });

      if (error) throw error;

      toast.success("Reconciliation record saved!");
      setCashReceived("");
      setNotes("");
      setIsPartial(false);
      fetchRecords();
      calculateExpectedCash();
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
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <ClipboardList className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("reconciliation.title")}</h1>
          <p className="text-muted-foreground">{t("reconciliation.subtitle")}</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">{t("reconciliation.new")}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">{t("reconciliation.date")}</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedCash">{t("reconciliation.expected")} ({currencySymbol})</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="expectedCash"
                type="number"
                step="0.01"
                disabled={isPartial}
                className="pl-10 h-12 text-xl font-bold bg-muted/50"
                value={isPartial ? cashReceived : expectedCash}
                onChange={(e) => setExpectedCash(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("reconciliation.expectedHint")} {selectedDate}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cashReceived">{t("reconciliation.received")} ({currencySymbol})</Label>
            <Input
              id="cashReceived"
              type="number"
              step="0.01"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              placeholder={t("reconciliation.receivedPlaceholder")}
            />
          </div>

          <div className="flex items-center space-x-2 py-2">
            <input
              type="checkbox"
              id="isPartial"
              checked={isPartial}
              onChange={(e) => setIsPartial(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
            />
            <Label htmlFor="isPartial" className="cursor-pointer font-medium text-primary">
              {t("reconciliation.isPartial") || "This is a partial count (keep remaining sales for later)"}
            </Label>
          </div>

          {cashReceived && !isPartial && (
            <div
              className={`p-4 rounded-lg border-2 ${Math.abs(discrepancy) > 0.01
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
                  {Math.abs(discrepancy) > 0.01 ? t("reconciliation.discrepancyDetected") : t("reconciliation.perfectMatch")}
                </span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(Math.abs(discrepancy))} {discrepancy > 0 ? t("reconciliation.short") : discrepancy < 0 ? t("reconciliation.over") : ""}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">{t("reconciliation.notes")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("reconciliation.notesPlaceholder")}
              rows={3}
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading || !cashReceived}
          >
            {isLoading ? t("common.saving") : t("reconciliation.submit")}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">{t("reconciliation.history")}</h3>
        <div className="space-y-3">
          {records.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">{t("reconciliation.noRecords")}</p>
          ) : (
            records.map((record) => {
              const diff = record.expected_cash - record.cash_received;
              const isPartialRecord = record.notes?.includes("[Partial Count]");
              return (
                <div key={record.id} className="p-4 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{new Date(record.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("reconciliation.expectedLabel")}: {formatCurrency(record.expected_cash)} | {t("reconciliation.receivedLabel")}: {formatCurrency(record.cash_received)}
                      </p>
                      {record.notes && (
                        <p className="text-sm text-muted-foreground mt-1 italic">{record.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${isPartialRecord
                          ? "bg-amber-100 text-amber-700"
                          : record.status === "approved"
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                          }`}
                      >
                        {isPartialRecord
                          ? "PARTIAL"
                          : (record.status === "approved" ? t("reconciliation.statusApproved") : t("reconciliation.statusDisputed"))}
                      </span>
                      {!isPartialRecord && Math.abs(diff) > 0.01 && (
                        <p className="text-sm font-semibold mt-1">
                          {formatCurrency(Math.abs(diff))} {diff > 0 ? t("reconciliation.short") : t("reconciliation.over")}
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
