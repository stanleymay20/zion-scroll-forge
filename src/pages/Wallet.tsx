import { useState } from "react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coins, TrendingUp, ArrowUpRight, ArrowDownRight, 
  Loader2, Clock 
} from "lucide-react";
import { useWallet, useEarnScrollCoin, useSpendScrollCoin } from "@/hooks/useScrollCoin";

export default function Wallet() {
  const { data: walletData, isLoading } = useWallet();
  const earnMutation = useEarnScrollCoin();
  const spendMutation = useSpendScrollCoin();

  const [earnAmount, setEarnAmount] = useState("");
  const [earnDescription, setEarnDescription] = useState("");
  const [spendAmount, setSpendAmount] = useState("");
  const [spendDescription, setSpendDescription] = useState("");

  const handleEarn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!earnAmount || !earnDescription) return;
    
    await earnMutation.mutateAsync({
      amount: Number(earnAmount),
      description: earnDescription
    });
    
    setEarnAmount("");
    setEarnDescription("");
  };

  const handleSpend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spendAmount || !spendDescription) return;
    
    await spendMutation.mutateAsync({
      amount: Number(spendAmount),
      description: spendDescription
    });
    
    setSpendAmount("");
    setSpendDescription("");
  };

  if (isLoading || !walletData) {
    return (
      <PageTemplate title="ScrollCoin Wallet" description="Loading...">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        </div>
      </PageTemplate>
    );
  }

  const balance = walletData.wallet?.balance || 0;
  const transactions = walletData.transactions || [];

  return (
    <PageTemplate
      title="ScrollCoin Wallet"
      description="Manage your ScrollCoin balance and transactions"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="lg:col-span-1">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Coins className="h-6 w-6 text-primary" />
                <span>Current Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                {Math.round(balance)}
              </div>
              <Badge variant="secondary">ScrollCoins</Badge>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="earn" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="earn">Earn</TabsTrigger>
                  <TabsTrigger value="spend">Spend</TabsTrigger>
                </TabsList>
                
                <TabsContent value="earn">
                  <form onSubmit={handleEarn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="earnAmount">Amount</Label>
                      <Input
                        id="earnAmount"
                        type="number"
                        placeholder="100"
                        value={earnAmount}
                        onChange={(e) => setEarnAmount(e.target.value)}
                        disabled={earnMutation.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="earnDesc">Description</Label>
                      <Input
                        id="earnDesc"
                        placeholder="Course completion bonus"
                        value={earnDescription}
                        onChange={(e) => setEarnDescription(e.target.value)}
                        disabled={earnMutation.isPending}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={!earnAmount || !earnDescription || earnMutation.isPending}
                    >
                      {earnMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Earn ScrollCoins
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="spend">
                  <form onSubmit={handleSpend} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="spendAmount">Amount</Label>
                      <Input
                        id="spendAmount"
                        type="number"
                        placeholder="50"
                        value={spendAmount}
                        onChange={(e) => setSpendAmount(e.target.value)}
                        disabled={spendMutation.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spendDesc">Description</Label>
                      <Input
                        id="spendDesc"
                        placeholder="Premium course access"
                        value={spendDescription}
                        onChange={(e) => setSpendDescription(e.target.value)}
                        disabled={spendMutation.isPending}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={!spendAmount || !spendDescription || spendMutation.isPending}
                    >
                      {spendMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Coins className="h-4 w-4 mr-2" />
                          Spend ScrollCoins
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent ScrollCoin activity</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          tx.type === 'earned' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {tx.type === 'earned' ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(tx.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        tx.type === 'earned' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'earned' ? '+' : '-'}{Math.round(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
