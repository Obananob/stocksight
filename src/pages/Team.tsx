import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";
import { Users, UserPlus, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface SalesRep {
    id: string;
    user_id: string;
    created_at: string;
    profile?: {
        name: string;
        email: string;
    };
}

const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    let password = "";
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

const Team = () => {
    const { user } = useAuth();
    const { t } = useSettings();
    const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form state
    const [repName, setRepName] = useState("");
    const [repEmail, setRepEmail] = useState("");
    const [generatedPassword, setGeneratedPassword] = useState("");
    const [createdEmail, setCreatedEmail] = useState("");

    useEffect(() => {
        fetchSalesReps();
    }, []);

    const fetchSalesReps = async () => {
        try {
            const { data, error } = await supabase
                .from("user_roles")
                .select("id, user_id, created_at")
                .eq("owner_id", user?.id)
                .eq("role", "sales_rep");

            if (error) throw error;

            // Fetch profiles for each sales rep
            if (data && data.length > 0) {
                const userIds = data.map((r) => r.user_id);
                const { data: profiles } = await supabase
                    .from("profiles")
                    .select("id, name, email")
                    .in("id", userIds);

                const repsWithProfiles = data.map((rep) => ({
                    ...rep,
                    profile: profiles?.find((p) => p.id === rep.user_id) || undefined,
                }));
                setSalesReps(repsWithProfiles);
            } else {
                setSalesReps([]);
            }
        } catch (error: any) {
            toast.error(t("team.loadFailed"));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSalesRep = async () => {
        if (!repName.trim() || !repEmail.trim()) {
            toast.error(t("team.fillFields"));
            return;
        }

        setIsAdding(true);
        const password = generatePassword();

        try {
            // Create a temporary Supabase client that won't persist sessions.
            // This way, signUp() won't affect the owner's active session.
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                { auth: { persistSession: false } }
            );

            // Create the new user account via the temp client
            const { data: signUpData, error: signUpError } = await tempClient.auth.signUp({
                email: repEmail.trim(),
                password,
                options: {
                    data: { name: repName.trim() },
                },
            });

            if (signUpError) throw signUpError;
            if (!signUpData.user) throw new Error("Failed to create user");

            // Convert the new user's auto-assigned 'owner' role to 'sales_rep'
            const { error: rpcError } = await supabase.rpc("convert_to_sales_rep" as any, {
                _user_id: signUpData.user.id,
            });

            if (rpcError) throw rpcError;

            // Show credentials to the owner
            setGeneratedPassword(password);
            setCreatedEmail(repEmail.trim());
            setDialogOpen(false);
            setCredentialsDialogOpen(true);

            // Reset form
            setRepName("");
            setRepEmail("");

            // Refresh list
            fetchSalesReps();
            toast.success(t("team.repAdded"));
        } catch (error: any) {
            toast.error(error.message || t("team.addFailed"));
            console.error(error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveSalesRep = async (roleId: string, repName: string) => {
        if (!confirm(t("team.removeConfirm").replace("{name}", repName))) return;

        try {
            const { error } = await supabase
                .from("user_roles")
                .delete()
                .eq("id", roleId);

            if (error) throw error;

            toast.success(t("team.repRemoved"));
            fetchSalesReps();
        } catch (error: any) {
            toast.error(t("team.removeFailed"));
            console.error(error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(t("common.copied"));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{t("team.title")}</h1>
                        <p className="text-muted-foreground">{t("team.subtitle")}</p>
                    </div>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            {t("team.addRep")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("team.addRep")}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="repName">{t("profile.name")}</Label>
                                <Input
                                    id="repName"
                                    value={repName}
                                    onChange={(e) => setRepName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="repEmail">{t("profile.email")}</Label>
                                <Input
                                    id="repEmail"
                                    type="email"
                                    value={repEmail}
                                    onChange={(e) => setRepEmail(e.target.value)}
                                    placeholder="e.g. john@example.com"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {t("team.passwordNote")}
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button onClick={handleAddSalesRep} disabled={isAdding}>
                                {isAdding ? t("common.saving") : t("team.createAccount")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Credentials Dialog - shown after creating a sales rep */}
            <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("team.credentialsTitle")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <p className="text-sm font-semibold text-amber-600 mb-2">
                                ⚠️ {t("team.credentialsWarning")}
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
                                <div>
                                    <p className="text-xs text-muted-foreground">{t("profile.email")}</p>
                                    <p className="font-mono font-semibold">{createdEmail}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(createdEmail)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
                                <div>
                                    <p className="text-xs text-muted-foreground">{t("profile.password")}</p>
                                    <p className="font-mono font-semibold">
                                        {showPassword ? generatedPassword : "••••••••••••"}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedPassword)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => {
                            setCredentialsDialogOpen(false);
                            setShowPassword(false);
                        }}>
                            {t("team.done")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Sales Reps Table */}
            <Card className="p-6">
                {isLoading ? (
                    <p className="text-center text-muted-foreground py-8">{t("common.loading")}</p>
                ) : salesReps.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-lg font-semibold text-muted-foreground">{t("team.noReps")}</p>
                        <p className="text-sm text-muted-foreground mt-1">{t("team.noRepsHint")}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("profile.name")}</TableHead>
                                    <TableHead>{t("profile.email")}</TableHead>
                                    <TableHead>{t("team.dateAdded")}</TableHead>
                                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salesReps.map((rep) => (
                                    <TableRow key={rep.id}>
                                        <TableCell className="font-medium">
                                            {rep.profile?.name || "—"}
                                        </TableCell>
                                        <TableCell>{rep.profile?.email || "—"}</TableCell>
                                        <TableCell>
                                            {new Date(rep.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleRemoveSalesRep(rep.id, rep.profile?.name || "this rep")}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Team;
