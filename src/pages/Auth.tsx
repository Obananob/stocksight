import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/contexts/SettingsContext";

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword } = useAuth();
  const { t } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    setIsLoading(false);

    if (error) {
      console.error("Login raw error:", error);
      toast.error(error.message || t("auth.failed") || "Login failed");
    } else {
      toast.success(t("auth.loginSuccess"));
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(signupEmail, signupPassword, signupName, signupPhone);

    setIsLoading(false);

    if (error) {
      console.error("Signup raw error:", error);
      toast.error(error.message || t("auth.failed") || "Signup failed");
    } else {
      toast.success(t("auth.signupSuccess"));
      navigate("/dashboard");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await resetPassword(resetEmail);

    setIsLoading(false);

    if (error) {
      toast.error(error.message || t("auth.resetFailed") || "Failed to send reset email");
    } else {
      toast.success(t("auth.resetLinkSent"));
      setShowForgotPassword(false);
      setResetEmail("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Package className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">ShopCount</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.tagline")}
          </p>
        </div>

        <Card className="p-6">
          {showForgotPassword ? (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">{t("auth.resetPasswordTitle")}</h2>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">{t("auth.emailLabel")}</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover"
                  disabled={isLoading}
                >
                  {isLoading ? t("auth.sending") : t("auth.resetLinkButton")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowForgotPassword(false)}
                >
                  {t("auth.backToLogin")}
                </Button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("auth.loginTab")}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth.signupTab")}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.emailLabel")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("auth.passwordLabel")}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder={t("auth.passwordPlaceholder")}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm text-primary"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    {t("auth.forgotPassword")}
                  </Button>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover"
                    disabled={isLoading}
                  >
                    {isLoading ? t("auth.loggingIn") : t("auth.loginButton")}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("auth.signupNameLabel")}</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t("auth.signupNamePlaceholder")}
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t("auth.emailLabel")}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("auth.signupPhoneLabel")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t("auth.signupPhonePlaceholder")}
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t("auth.signupPasswordLabel")}</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder={t("auth.signupPasswordPlaceholder")}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover"
                    disabled={isLoading}
                  >
                    {isLoading ? t("auth.signingUp") : t("auth.signupButton")}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t("auth.termsNote")}
        </p>
      </div>
    </div>
  );
};

export default Auth;
