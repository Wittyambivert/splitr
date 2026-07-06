import { useState, useCallback, useMemo } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft, Camera, Check, Clipboard, Copy, CreditCard, Equal, ImagePlus,
  MoreVertical, PieChart, Plus, ScanLine, Star, UserPlus,
} from 'lucide-react-native';
import { Card, Tag, IconCircle, Button, BottomSheet } from '@/components/ui';
import { useAuth, useExpenses } from '@/hooks';
import { useGroupStore } from '@/stores';
import { formatCurrency, formatRelativeTime, getInitials, pluralize, calculateSplit, simplifyDebts, calculateNetBalancesForMembers } from '@/utils';
import { getVirtualCard, scanReceipt } from '@/services';
import type { VirtualCard as VirtualCardType, OcrResult } from '@/services';
import type { SplitType, OcrItem, ExpenseSplit, ExpenseCategory, NetBalance, SimplifiedDebt } from '@/types';

const PASTEL_COLORS = [
  { bg: 'bg-pastel-pink', ink: 'text-pastel-pink-ink' },
  { bg: 'bg-pastel-lilac', ink: 'text-pastel-lilac-ink' },
  { bg: 'bg-pastel-sky', ink: 'text-pastel-sky-ink' },
  { bg: 'bg-pastel-mint', ink: 'text-pastel-mint-ink' },
];

function getPastel(index: number) {
  return PASTEL_COLORS[index % PASTEL_COLORS.length];
}

function getMemberLabel(uid: string, currentUid: string | undefined, index: number): string {
  if (uid === currentUid) return 'You';
  return `Member ${index + 1}`;
}

type ScanStage = 'idle' | 'scanning' | 'reviewing' | 'error';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const groups = useGroupStore((s) => s.groups);
  const { expenses, isLoading: expensesLoading, createExpense } = useExpenses(id ?? '');

  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showScanBill, setShowScanBill] = useState(false);
  const [showSplitBill, setShowSplitBill] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  const [scanStage, setScanStage] = useState<ScanStage>('idle');
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanCreating, setScanCreating] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);

  const [splitAmount, setSplitAmount] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [splitPercentages, setSplitPercentages] = useState<Record<string, number>>({});
  const [splitCreating, setSplitCreating] = useState(false);

  const [wallet] = useState<VirtualCardType>(getVirtualCard);

  const group = groups.find((g) => g.groupId === id);
  const members = useMemo(() => group?.members ?? [], [group?.members]);
  const currentUid = user?.uid;

  const memberNames = useMemo(
    () => new Map(members.map((uid, i) => [uid, getMemberLabel(uid, currentUid, i)])),
    [members, currentUid],
  );

  const netBalances: NetBalance[] = useMemo(
    () => calculateNetBalancesForMembers(expenses, memberNames),
    [expenses, memberNames],
  );

  const settlements: SimplifiedDebt[] = useMemo(
    () => simplifyDebts(expenses, memberNames),
    [expenses, memberNames],
  );

  const splitPreview = useMemo((): ExpenseSplit[] => {
    const amount = parseFloat(splitAmount);
    if (isNaN(amount) || amount <= 0 || members.length === 0) return members.map((uid) => ({ uid, amount: 0 }));
    return calculateSplit({
      totalAmount: amount,
      memberIds: members,
      splitType,
      percentages: splitPercentages,
    });
  }, [splitAmount, splitType, splitPercentages, members]);

  const pickImage = useCallback(async (useCamera: boolean) => {
    setScanError(null);
    setOcrResult(null);

    try {
      let result: ImagePicker.ImagePickerResult;
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return;
        result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return;
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      }

      if (result.canceled || !result.assets[0]) return;

      setScanStage('scanning');
      const data = await scanReceipt(result.assets[0].uri);

      if (data.items.length > 0) {
        setOcrResult(data);
        setScanStage('reviewing');
      } else {
        setScanStage('error');
        setScanError('No items detected in the receipt.');
      }
    } catch (err) {
      setScanStage('error');
      setScanError(err instanceof Error ? err.message : 'Failed to process image');
    }
  }, []);

  const handleCloseScan = useCallback(() => {
    setShowScanBill(false);
    setScanStage('idle');
    setScanError(null);
    setOcrResult(null);
  }, []);

  const handleSaveScan = useCallback(async () => {
    if (!group || !ocrResult || scanCreating) return;
    setScanCreating(true);
    try {
      const items: OcrItem[] = ocrResult.items;
      const equalSplits = calculateSplit({
        totalAmount: ocrResult.total,
        memberIds: members,
        splitType: 'equal',
      });
      await createExpense({
        groupId: group.groupId,
        title: items.length > 0 ? items.slice(0, 2).map((i) => i.name).join(', ') + ' & more' : 'Receipt scan',
        totalAmount: ocrResult.total,
        currency: group.currency,
        category: items[0]?.category ?? 'other' as ExpenseCategory,
        paidBy: currentUid ?? members[0],
        splits: equalSplits,
        splitType: 'equal',
        receiptImageUrl: null,
        ocrItems: items,
        locked: false,
        notes: null,
      });
      handleCloseScan();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save expense');
    } finally {
      setScanCreating(false);
    }
  }, [group, ocrResult, scanCreating, members, currentUid, createExpense, handleCloseScan]);

  const handleOpenSplit = useCallback(() => {
    setSplitAmount('');
    setSplitType('equal');
    setSplitPercentages({});
    setShowSplitBill(true);
  }, []);

  const handleSplitTypeChange = useCallback((type: SplitType) => {
    setSplitType(type);
    if (type === 'percentage' && members.length > 0) {
      const equalPct = Math.floor(100 / members.length);
      const pcts: Record<string, number> = {};
      members.forEach((uid, i) => {
        pcts[uid] = i === 0 ? 100 - equalPct * (members.length - 1) : equalPct;
      });
      setSplitPercentages(pcts);
    }
  }, [members]);

  const handlePercentageChange = useCallback((uid: string, value: string) => {
    const num = parseFloat(value);
    setSplitPercentages((prev) => ({ ...prev, [uid]: isNaN(num) ? 0 : num }));
  }, []);

  const handleSaveSplit = useCallback(async () => {
    if (!group) return;
    const amount = parseFloat(splitAmount);
    if (isNaN(amount) || amount <= 0) return;

    setSplitCreating(true);
    try {
      await createExpense({
        groupId: group.groupId,
        title: 'Manual split',
        totalAmount: amount,
        currency: group.currency,
        category: 'other' as ExpenseCategory,
        paidBy: currentUid ?? members[0],
        splits: splitPreview,
        splitType,
        receiptImageUrl: null,
        ocrItems: [],
        locked: false,
        notes: null,
      });
      setShowSplitBill(false);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save expense');
    } finally {
      setSplitCreating(false);
    }
  }, [group, splitAmount, splitPreview, splitType, currentUid, members, createExpense]);

  const handleCopyLink = useCallback(() => {
    Alert.alert('Invite Link', 'Invite link copied to clipboard!');
  }, []);

  if (!group) {
    return (
      <View className="flex-1 bg-canvas items-center justify-center gap-3">
        <Text className="font-heading text-lg text-ink">Group not found</Text>
        <Button variant="secondary" label="Go back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-row items-center px-5 py-3">
          <IconCircle icon={ArrowLeft} variant="surface" accessibilityLabel="Go back" onPress={() => router.back()} />
          <View className="flex-1 ml-3">
            <Text className="font-heading text-[17px] text-ink">{group.name}</Text>
            <Text className="text-sm text-ink-muted">{members.length} {pluralize(members.length, 'member')}</Text>
          </View>
          <IconCircle icon={MoreVertical} variant="surface" accessibilityLabel="Menu" />
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Card variant="blob" className="bg-accent-violet/10">
            <View className="w-14 h-14 rounded-pill bg-accent-violet items-center justify-center -mt-8">
              <Check size={24} color="#FFFFFF" />
            </View>
            <Text className="font-heading text-[17px] text-ink">Settle Up</Text>
            <Text className="text-sm text-ink-muted text-center">
              {settlements.length > 0
                ? `${settlements.length} ${pluralize(settlements.length, 'payment')} needed to settle all balances`
                : 'All settled — no payments needed'}
            </Text>
            <Button variant="primary" label="Settle Up" onPress={() => {}} />
          </Card>

          <Card variant="hero">
            <Text className="text-xs text-ink-muted font-heading uppercase tracking-wide">Net Balances</Text>
            {netBalances.length === 0 ? (
              <Text className="text-sm text-ink-muted py-2">No balances yet. Add an expense to get started.</Text>
            ) : (
              netBalances.map((nb, i) => {
                const isPositive = nb.netAmount >= 0;
                return (
                  <View key={nb.uid} className="flex-row items-center justify-between py-2">
                    <View className="flex-row items-center gap-3">
                      <View className={`w-9 h-9 rounded-pill ${getPastel(i).bg} items-center justify-center`}>
                        <Text className={`font-heading text-[11px] ${getPastel(i).ink}`}>
                          {getInitials(memberNames.get(nb.uid) ?? '?')}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        <Text className="font-medium text-[15px] text-ink">
                          {memberNames.get(nb.uid) ?? 'Unknown'}
                        </Text>
                        {nb.uid === group.createdBy && (
                          <Star size={14} color="#F4C430" />
                        )}
                      </View>
                    </View>
                    <Text className={`font-display text-lg ${isPositive ? 'text-success' : 'text-danger'}`}>
                      {isPositive ? '+' : ''}{formatCurrency(nb.netAmount, group.currency)}
                    </Text>
                  </View>
                );
              })
            )}
          </Card>

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-surface rounded-pill h-12 flex-row items-center justify-center gap-2 shadow-[0_8px_16px_rgba(21,19,22,0.06)] active:opacity-80"
              onPress={() => setShowAddMembers(true)}
              accessibilityRole="button"
              accessibilityLabel="Add members"
            >
              <UserPlus size={16} color="#151316" />
              <Text className="font-heading text-[13px] text-ink">Add Members</Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-surface rounded-pill h-12 flex-row items-center justify-center gap-2 shadow-[0_8px_16px_rgba(21,19,22,0.06)] active:opacity-80"
              onPress={() => {
                setShowScanBill(true);
                setScanStage('idle');
                setScanError(null);
                setOcrResult(null);
              }}
              accessibilityRole="button"
              accessibilityLabel="Scan bill"
            >
              <ScanLine size={16} color="#151316" />
              <Text className="font-heading text-[13px] text-ink">Scan Bill</Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-surface rounded-pill h-12 flex-row items-center justify-center gap-2 shadow-[0_8px_16px_rgba(21,19,22,0.06)] active:opacity-80"
              onPress={handleOpenSplit}
              accessibilityRole="button"
              accessibilityLabel="Split bill"
            >
              <PieChart size={16} color="#151316" />
              <Text className="font-heading text-[13px] text-ink">Split Bill</Text>
            </Pressable>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-ink-muted font-heading uppercase tracking-wide">Expenses</Text>
            <IconCircle
              icon={Plus}
              variant="surface"
              size={36}
              iconSize={16}
              accessibilityLabel="Add expense"
              onPress={() => router.push('/expense/new')}
            />
          </View>

          {expensesLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#C6F24E" />
            </View>
          ) : expenses.length === 0 ? (
            <Card variant="hero" className="items-center py-8 gap-2">
              <View className="w-12 h-12 rounded-pill bg-canvas-alt items-center justify-center">
                <ScanLine size={22} color="#8A8791" />
              </View>
              <Text className="font-heading text-[17px] text-ink">No expenses yet</Text>
              <Text className="text-sm text-ink-muted text-center">Scan a bill or add an expense to get started</Text>
            </Card>
          ) : (
            expenses.map((expense) => (
              <Pressable
                key={expense.expenseId}
                onPress={() => router.push({ pathname: '/expense/[id]', params: { id: expense.expenseId } })}
              >
                <Card variant="hero">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-heading text-[17px] text-ink">{expense.title}</Text>
                      <Text className="text-sm text-ink-muted">
                        Paid by {memberNames.get(expense.paidBy) ?? 'Unknown'} · {formatRelativeTime(expense.createdAt)}
                      </Text>
                    </View>
                    <Text className="font-display text-lg text-ink">{formatCurrency(expense.totalAmount, expense.currency)}</Text>
                  </View>
                  <View className="flex-row gap-2 mt-2">
                    <Tag label={expense.splitType === 'equal' ? 'Equal' : expense.splitType === 'percentage' ? 'Percentage' : 'Custom'} variant="pastel-mint" />
                    {expense.locked ? <Tag label="Locked" variant="pastel-pink" /> : null}
                  </View>
                </Card>
              </Pressable>
            ))
          )}

          <Pressable
            className="flex-row items-center justify-between bg-surface-black rounded-xl p-5 gap-3 active:opacity-80"
            onPress={() => setShowWallet(true)}
            accessibilityRole="button"
            accessibilityLabel="Create virtual wallet"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-pill bg-brand-lime items-center justify-center">
                <CreditCard size={18} color="#173300" />
              </View>
              <View>
                <Text className="font-heading text-[15px] text-white">Virtual Wallet</Text>
                <Text className="text-sm text-white/60">Fund group expenses securely</Text>
              </View>
            </View>
            <Plus size={18} color="rgba(255,255,255,0.5)" />
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <BottomSheet visible={showAddMembers} onClose={() => setShowAddMembers(false)}>
        <View className="px-5 gap-6 items-center">
          <Text className="font-heading text-xl text-white">Invite Members</Text>
          <View className="bg-[rgba(255,255,255,0.1)] rounded-md h-48 w-48 items-center justify-center">
            <ScanLine size={48} color="rgba(255,255,255,0.3)" />
            <Text className="text-sm text-white/30 mt-2">QR Code</Text>
          </View>
          <Pressable
            className="flex-row items-center gap-2 bg-[rgba(255,255,255,0.1)] rounded-pill px-5 h-12 active:opacity-80"
            onPress={handleCopyLink}
            accessibilityRole="button"
            accessibilityLabel="Copy invite link"
          >
            <Copy size={16} color="#FFFFFF" />
            <Text className="font-heading text-[14px] text-white">Copy Invite Link</Text>
          </Pressable>
          <Text className="text-xs text-white/40 text-center">Share this link with friends to join {group.name}</Text>
        </View>
      </BottomSheet>

      <BottomSheet visible={showScanBill} onClose={handleCloseScan}>
        <View className="px-5 gap-6">
          <Text className="font-heading text-xl text-white">Scan Bill</Text>

          {scanStage === 'idle' && (
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 bg-[rgba(255,255,255,0.1)] rounded-lg p-5 items-center gap-3 active:opacity-80"
                onPress={() => pickImage(true)}
                accessibilityRole="button"
                accessibilityLabel="Take photo"
              >
                <Camera size={28} color="#FFFFFF" />
                <Text className="font-medium text-[14px] text-white">Take Photo</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-[rgba(255,255,255,0.1)] rounded-lg p-5 items-center gap-3 active:opacity-80"
                onPress={() => pickImage(false)}
                accessibilityRole="button"
                accessibilityLabel="Upload from gallery"
              >
                <ImagePlus size={28} color="#FFFFFF" />
                <Text className="font-medium text-[14px] text-white">Upload</Text>
              </Pressable>
            </View>
          )}

          {scanStage === 'scanning' && (
            <View className="items-center gap-4 py-6">
              <ActivityIndicator size="large" color="#C6F24E" />
              <Text className="text-white text-sm font-medium">Scanning receipt...</Text>
            </View>
          )}

          {scanStage === 'error' && (
            <View className="items-center gap-4">
              <View className="w-14 h-14 rounded-pill bg-[rgba(226,85,75,0.2)] items-center justify-center">
                <ScanLine size={24} color="#E2554B" />
              </View>
              <Text className="text-white text-center font-medium">{scanError ?? 'Failed to scan receipt'}</Text>
              <View className="flex-row gap-3">
                <Pressable
                  className="bg-[rgba(255,255,255,0.1)] rounded-pill px-5 h-11 items-center justify-center active:opacity-80"
                  onPress={() => setScanStage('idle')}
                  accessibilityRole="button"
                  accessibilityLabel="Try again"
                >
                  <Text className="font-heading text-[14px] text-white">Try Again</Text>
                </Pressable>
              </View>
            </View>
          )}

          {scanStage === 'reviewing' && ocrResult && (
            <View className="gap-4">
              {ocrResult.confidence > 0 && (
                <Tag
                  label={ocrResult.confidence >= 0.8 ? 'High confidence' : ocrResult.confidence >= 0.5 ? 'Medium confidence' : 'Low confidence'}
                  variant={ocrResult.confidence >= 0.8 ? 'pastel-mint' : ocrResult.confidence >= 0.5 ? 'amber' : 'pastel-pink'}
                />
              )}
              <View className="gap-2">
                {ocrResult.items.map((item, i) => (
                  <View key={i} className="flex-row justify-between items-center py-2">
                    <View className="flex-1">
                      <Text className="font-medium text-[15px] text-white">{item.name}</Text>
                      {item.quantity > 1 ? (
                        <Text className="text-xs text-white/50">{item.quantity}x</Text>
                      ) : null}
                    </View>
                    <Text className="font-display text-lg text-white">{formatCurrency(item.price, group.currency)}</Text>
                  </View>
                ))}
              </View>
              <View className="h-px bg-white/20" />
              <View className="flex-row justify-between">
                <Text className="font-heading text-[15px] text-white">Total</Text>
                <Text className="font-display text-xl text-white">{formatCurrency(ocrResult.total, group.currency)}</Text>
              </View>
              <Button
                variant="primary"
                label={scanCreating ? 'Saving...' : 'Save as Expense'}
                onPress={handleSaveScan}
                disabled={scanCreating}
              />
            </View>
          )}
        </View>
      </BottomSheet>

      <BottomSheet visible={showSplitBill} onClose={() => setShowSplitBill(false)}>
        <View className="px-5 gap-6">
          <Text className="font-heading text-xl text-white">Split Bill</Text>

          <View className="bg-[rgba(255,255,255,0.1)] rounded-md px-4 py-3">
            <Text className="text-xs text-white/60 font-heading uppercase tracking-wide mb-1">Amount</Text>
            <TextInput
              className="font-display text-[32px] text-white"
              placeholder="0.00"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="decimal-pad"
              value={splitAmount}
              onChangeText={setSplitAmount}
            />
          </View>

          <View>
            <Text className="text-xs text-white/60 font-heading uppercase tracking-wide mb-3">Split Type</Text>
            <View className="flex-row gap-3">
              <Pressable
                className={`flex-1 items-center py-3 rounded-md gap-1 ${splitType === 'equal' ? 'bg-brand-lime' : 'bg-[rgba(255,255,255,0.1)]'}`}
                onPress={() => handleSplitTypeChange('equal')}
              >
                <Equal size={18} color={splitType === 'equal' ? '#173300' : '#FFFFFF'} />
                <Text className={`font-heading text-[11px] ${splitType === 'equal' ? 'text-brand-lime-ink' : 'text-white/70'}`}>Equal</Text>
              </Pressable>
              <Pressable
                className={`flex-1 items-center py-3 rounded-md gap-1 ${splitType === 'percentage' ? 'bg-brand-lime' : 'bg-[rgba(255,255,255,0.1)]'}`}
                onPress={() => handleSplitTypeChange('percentage')}
              >
                <PieChart size={18} color={splitType === 'percentage' ? '#173300' : '#FFFFFF'} />
                <Text className={`font-heading text-[11px] ${splitType === 'percentage' ? 'text-brand-lime-ink' : 'text-white/70'}`}>Percentage</Text>
              </Pressable>
            </View>
          </View>

          {splitType === 'percentage' && (
            <View className="gap-3">
              {members.map((uid, i) => (
                <View key={uid} className="flex-row items-center gap-3">
                  <View className={`w-9 h-9 rounded-pill ${getPastel(i).bg} items-center justify-center`}>
                    <Text className={`font-heading text-[11px] ${getPastel(i).ink}`}>
                      {getInitials(memberNames.get(uid) ?? '?')}
                    </Text>
                  </View>
                  <Text className="flex-1 font-medium text-[15px] text-white">
                    {memberNames.get(uid) ?? 'Unknown'}
                  </Text>
                  <View className="bg-[rgba(255,255,255,0.1)] rounded-md w-20 h-10 items-center justify-center flex-row gap-1">
                    <TextInput
                      className="font-heading text-[15px] text-white text-center"
                      keyboardType="decimal-pad"
                      value={String(splitPercentages[uid] ?? 0)}
                      onChangeText={(v) => handlePercentageChange(uid, v)}
                      maxLength={3}
                    />
                    <Text className="font-heading text-[15px] text-white/60">%</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {splitPreview.length > 0 && parseFloat(splitAmount) > 0 && (
            <View>
              <Text className="text-xs text-white/60 font-heading uppercase tracking-wide mb-3">Preview</Text>
              <View className="gap-2">
                {splitPreview.map((s, i) => (
                  <View key={s.uid} className="flex-row justify-between items-center py-1.5">
                    <Text className="font-medium text-[15px] text-white">
                      {memberNames.get(s.uid) ?? 'Unknown'}
                      {splitType === 'percentage' && s.percentage !== undefined ? (
                        <Text className="text-white/50"> ({s.percentage}%)</Text>
                      ) : null}
                    </Text>
                    <Text className="font-display text-lg text-white">{formatCurrency(s.amount, group?.currency ?? 'NGN')}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Button
            variant="primary"
            label={splitCreating ? 'Saving...' : 'Save Expense'}
            onPress={handleSaveSplit}
            disabled={splitCreating || !splitAmount || parseFloat(splitAmount) <= 0}
          />
        </View>
      </BottomSheet>

      <BottomSheet visible={showWallet} onClose={() => setShowWallet(false)}>
        <View className="px-5 gap-6">
          <Text className="font-heading text-xl text-white">Virtual Wallet</Text>

          <View className="bg-gradient-to-br from-surface-black to-surface-black border border-brand-lime rounded-xl p-5 gap-4">
            <Text className="text-xs text-white/60 font-heading uppercase tracking-wide">Card Details</Text>

            <View>
              <Text className="text-xs text-white/40 mb-1">Card Number</Text>
              <View className="flex-row items-center justify-between">
                <Text className="font-display text-lg text-white tracking-widest">{wallet.cardNumber}</Text>
                <Pressable
                  className="w-8 h-8 items-center justify-center"
                  onPress={() => Alert.alert('Copied', 'Card number copied to clipboard')}
                  accessibilityLabel="Copy card number"
                >
                  <Clipboard size={16} color="rgba(255,255,255,0.6)" />
                </Pressable>
              </View>
            </View>

            <View className="flex-row gap-6">
              <View className="flex-1">
                <Text className="text-xs text-white/40 mb-1">Expiry</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="font-display text-base text-white">{wallet.expiry}</Text>
                  <Pressable
                    className="w-8 h-8 items-center justify-center"
                    onPress={() => Alert.alert('Copied', 'Expiry date copied to clipboard')}
                    accessibilityLabel="Copy expiry"
                  >
                    <Clipboard size={14} color="rgba(255,255,255,0.6)" />
                  </Pressable>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-white/40 mb-1">CVV</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="font-display text-base text-white">{wallet.cvv}</Text>
                  <Pressable
                    className="w-8 h-8 items-center justify-center"
                    onPress={() => Alert.alert('Copied', 'CVV copied to clipboard')}
                    accessibilityLabel="Copy CVV"
                  >
                    <Clipboard size={14} color="rgba(255,255,255,0.6)" />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          <Text className="text-sm text-white/50 text-center">Share these details with group members to fund the wallet</Text>
        </View>
      </BottomSheet>
    </View>
  );
}
