import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {
  CarbonSpacing,
  CarbonTypography,
  CarbonThemeProvider,
  useCarbonTheme,
  CarbonThemeColors,
} from './src/theme/carbon';

interface WorkOrder {
  id: string;
  orderNumber: string;
  styleName: string;
  shoeType: string;
  pairs: number;
  stage: 'Cutting' | 'Stitching' | 'Lasting' | 'Assembly' | 'QC Inspection';
  status: 'In Progress' | 'Pending' | 'Quality Check';
  leatherLot: string;
}

const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-1',
    orderNumber: 'WO-2026-104',
    styleName: 'Oxford Brogue Derby',
    shoeType: 'Goodyear Welted Men',
    pairs: 120,
    stage: 'Lasting',
    status: 'In Progress',
    leatherLot: 'LT-CALF-BLK-88',
  },
  {
    id: 'wo-2',
    orderNumber: 'WO-2026-105',
    styleName: 'Chelsea Boot Chelsea-42',
    shoeType: 'Vibram Lug Commando',
    pairs: 250,
    stage: 'Stitching',
    status: 'In Progress',
    leatherLot: 'LT-SUEDE-DBR-14',
  },
  {
    id: 'wo-3',
    orderNumber: 'WO-2026-106',
    styleName: 'Minimalist Court Low',
    shoeType: 'Cupsole Cemented',
    pairs: 400,
    stage: 'Cutting',
    status: 'Pending',
    leatherLot: 'LT-NAPPA-WHT-02',
  },
];

function CobblERPScreen() {
  const { mode, colors, toggleTheme } = useCarbonTheme();
  const [workOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [updateStatus, setUpdateStatus] = useState<string>('System up to date');
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [loadingApi, setLoadingApi] = useState(false);

  const stages = ['All', 'Cutting', 'Stitching', 'Lasting', 'Assembly', 'QC Inspection'];

  const filteredOrders =
    selectedStage === 'All'
      ? workOrders
      : workOrders.filter((wo) => wo.stage === selectedStage);

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateStatus('Checking for OTA updates...');
    try {
      if (__DEV__) {
        setUpdateStatus('OTA Updates are managed via expo-updates (Simulated in DEV mode)');
      } else {
        const Updates = await import('expo-updates');
        if (Updates && typeof Updates.checkForUpdateAsync === 'function') {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            setUpdateStatus('New update downloaded. Restart app to apply.');
          } else {
            setUpdateStatus('Application is running latest bundle.');
          }
        } else {
          setUpdateStatus('expo-updates module not initialized.');
        }
      }
    } catch (err: any) {
      setUpdateStatus(`Update notice: ${err.message || 'Ready'}`);
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handlePingApi = async () => {
    setLoadingApi(true);
    try {
      const res = await fetch('http://localhost:4000/health');
      const data = await res.json();
      setApiStatus(`API Online (Uptime: ${Math.round(data.uptime)}s)`);
    } catch (err: any) {
      setApiStatus(`API Offline (${err.message})`);
    } finally {
      setLoadingApi(false);
    }
  };

  const getStatusBadgeStyle = (status: WorkOrder['status']) => {
    switch (status) {
      case 'In Progress':
        return {
          bg: colors.supportInfoBg,
          color: colors.supportInfo,
          border: colors.supportInfo,
        };
      case 'Quality Check':
        return {
          bg: colors.supportWarningBg,
          color: colors.supportWarning,
          border: colors.supportWarning,
        };
      case 'Pending':
      default:
        return {
          bg: colors.layer02,
          color: colors.textSecondary,
          border: colors.borderSubtle,
        };
    }
  };

  const dynamicStyles = getDynamicStyles(colors);

  return (
    <SafeAreaView style={[dynamicStyles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={mode === 'g100' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Carbon Top Shell Header */}
      <View style={[dynamicStyles.headerShell, { backgroundColor: colors.background, borderBottomColor: colors.borderSubtle }]}>
        <View style={dynamicStyles.headerLeft}>
          <View style={[dynamicStyles.headerAccentBar, { backgroundColor: colors.interactive01 }]} />
          <View>
            <View style={dynamicStyles.headerTitleRow}>
              <Text style={[dynamicStyles.headerBrand, { color: colors.textPrimary }]}>CobblERP</Text>
              <Text style={[dynamicStyles.headerSubBrand, { color: colors.interactive01 }]}>Shop Floor</Text>
            </View>
            <Text style={[dynamicStyles.headerSubtitle, { color: colors.textSecondary }]}>
              Footwear Manufacturing • Theme: {mode === 'g100' ? 'Gray 100 (Dark)' : 'White (Light)'}
            </Text>
          </View>
        </View>

        <View style={dynamicStyles.headerActions}>
          {/* Carbon Theme Toggle Button */}
          <TouchableOpacity
            style={[dynamicStyles.themeToggleBtn, { backgroundColor: colors.layer01, borderColor: colors.borderSubtle }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.themeToggleText, { color: colors.textPrimary }]}>
              {mode === 'g100' ? '☀️ Light' : '🌙 Dark'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[dynamicStyles.apiBadgeBtn, { backgroundColor: colors.layer01, borderColor: colors.borderSubtle }]}
            onPress={handlePingApi}
          >
            {loadingApi ? (
              <ActivityIndicator size="small" color={colors.interactive01} />
            ) : (
              <Text style={[dynamicStyles.apiBadgeText, { color: colors.textSecondary }]}>
                {apiStatus ? apiStatus : 'Check API'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.container}>
        {/* Footwear Production Summary Card (Carbon Tile) */}
        <View style={[dynamicStyles.carbonTile, { backgroundColor: colors.layer01, borderColor: colors.borderSubtle }]}>
          <Text style={[dynamicStyles.tileHeader, { color: colors.textPrimary }]}>Active Footwear Work Orders</Text>
          <Text style={[dynamicStyles.tileSubheader, { color: colors.textSecondary }]}>
            Total In-Production: 770 Pairs across 3 Production Lines
          </Text>

          {/* Production Stage Filter Bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.filterScroll}>
            <View style={dynamicStyles.filterRow}>
              {stages.map((stage) => {
                const isActive = selectedStage === stage;
                return (
                  <TouchableOpacity
                    key={stage}
                    style={[
                      dynamicStyles.filterChip,
                      {
                        backgroundColor: isActive ? colors.interactive01 : colors.layer02,
                        borderColor: isActive ? colors.interactive01 : colors.borderSubtle,
                      },
                    ]}
                    onPress={() => setSelectedStage(stage)}
                  >
                    <Text
                      style={[
                        dynamicStyles.filterChipText,
                        { color: isActive ? colors.textOnColor : colors.textSecondary },
                      ]}
                    >
                      {stage}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Work Orders List */}
        <View style={dynamicStyles.section}>
          <Text style={[dynamicStyles.sectionTitle, { color: colors.textSecondary }]}>
            Orders in Stage: <Text style={{ color: colors.interactive01, fontWeight: '600' }}>{selectedStage}</Text>
          </Text>

          {filteredOrders.map((wo) => {
            const badge = getStatusBadgeStyle(wo.status);
            return (
              <View
                key={wo.id}
                style={[dynamicStyles.orderCard, { backgroundColor: colors.layer01, borderColor: colors.borderSubtle }]}
              >
                <View style={dynamicStyles.orderHeader}>
                  <View>
                    <Text style={[dynamicStyles.orderNumber, { color: colors.interactive01 }]}>{wo.orderNumber}</Text>
                    <Text style={[dynamicStyles.styleName, { color: colors.textPrimary }]}>{wo.styleName}</Text>
                  </View>
                  <View
                    style={[
                      dynamicStyles.statusBadge,
                      { backgroundColor: badge.bg, borderColor: badge.border },
                    ]}
                  >
                    <Text style={[dynamicStyles.statusBadgeText, { color: badge.color }]}>
                      {wo.status}
                    </Text>
                  </View>
                </View>

                <View style={[dynamicStyles.orderDivider, { backgroundColor: colors.borderSubtle }]} />

                <View style={dynamicStyles.orderMetaGrid}>
                  <View style={dynamicStyles.metaItem}>
                    <Text style={[dynamicStyles.metaLabel, { color: colors.textPlaceholder }]}>Construction</Text>
                    <Text style={[dynamicStyles.metaValue, { color: colors.textPrimary }]}>{wo.shoeType}</Text>
                  </View>
                  <View style={dynamicStyles.metaItem}>
                    <Text style={[dynamicStyles.metaLabel, { color: colors.textPlaceholder }]}>Batch Pairs</Text>
                    <Text style={[dynamicStyles.metaValueHighlight, { color: colors.supportSuccess }]}>{wo.pairs} pairs</Text>
                  </View>
                  <View style={dynamicStyles.metaItem}>
                    <Text style={[dynamicStyles.metaLabel, { color: colors.textPlaceholder }]}>Current Stage</Text>
                    <Text style={[dynamicStyles.metaValue, { color: colors.textPrimary }]}>{wo.stage}</Text>
                  </View>
                  <View style={dynamicStyles.metaItem}>
                    <Text style={[dynamicStyles.metaLabel, { color: colors.textPlaceholder }]}>Leather Lot</Text>
                    <Text style={[dynamicStyles.metaValueMono, { color: colors.textSecondary }]}>{wo.leatherLot}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* OTA Update Management Card (Expo Updates Tooling) */}
        <View style={[dynamicStyles.carbonTile, { backgroundColor: colors.layer01, borderColor: colors.borderSubtle }]}>
          <Text style={[dynamicStyles.tileHeader, { color: colors.textPrimary }]}>Over-the-Air Update System</Text>
          <Text style={[dynamicStyles.tileSubheader, { color: colors.textSecondary }]}>
            Bare React Native architecture powered by expo-updates for seamless shop-floor updates.
          </Text>

          <TouchableOpacity
            style={[dynamicStyles.carbonPrimaryButton, { backgroundColor: colors.interactive01 }]}
            onPress={handleCheckUpdate}
            disabled={checkingUpdate}
          >
            {checkingUpdate ? (
              <ActivityIndicator color={colors.textOnColor} />
            ) : (
              <Text style={[dynamicStyles.carbonButtonText, { color: colors.textOnColor }]}>Check for Updates</Text>
            )}
          </TouchableOpacity>

          <View style={[dynamicStyles.updateStatusBar, { backgroundColor: colors.layer02, borderLeftColor: colors.interactive01 }]}>
            <Text style={[dynamicStyles.updateStatusText, { color: colors.textSecondary }]}>{updateStatus}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <CarbonThemeProvider>
      <CobblERPScreen />
    </CarbonThemeProvider>
  );
}

function getDynamicStyles(colors: CarbonThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      padding: CarbonSpacing.lg,
      gap: CarbonSpacing.lg,
      paddingBottom: 40,
    },
    headerShell: {
      borderBottomWidth: 1,
      paddingHorizontal: CarbonSpacing.lg,
      paddingVertical: CarbonSpacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: CarbonSpacing.md,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: CarbonSpacing.sm,
    },
    headerAccentBar: {
      width: 4,
      height: 36,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
    },
    headerBrand: {
      fontSize: CarbonTypography.heading01.fontSize,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    headerSubBrand: {
      fontSize: CarbonTypography.heading01.fontSize,
      fontWeight: '400',
    },
    headerSubtitle: {
      fontSize: CarbonTypography.caption.fontSize,
      marginTop: 2,
    },
    themeToggleBtn: {
      borderWidth: 1,
      paddingHorizontal: CarbonSpacing.sm,
      paddingVertical: 6,
    },
    themeToggleText: {
      fontSize: CarbonTypography.caption.fontSize,
      fontWeight: '600',
    },
    apiBadgeBtn: {
      borderWidth: 1,
      paddingHorizontal: CarbonSpacing.sm,
      paddingVertical: 6,
    },
    apiBadgeText: {
      fontSize: CarbonTypography.caption.fontSize,
      fontFamily: 'Courier',
    },
    carbonTile: {
      borderWidth: 1,
      padding: CarbonSpacing.lg,
      gap: CarbonSpacing.sm,
    },
    tileHeader: {
      fontSize: CarbonTypography.body02.fontSize,
      fontWeight: '600',
    },
    tileSubheader: {
      fontSize: CarbonTypography.body01.fontSize,
      lineHeight: 20,
    },
    filterScroll: {
      marginTop: CarbonSpacing.sm,
    },
    filterRow: {
      flexDirection: 'row',
      gap: CarbonSpacing.sm,
    },
    filterChip: {
      borderWidth: 1,
      paddingVertical: 6,
      paddingHorizontal: CarbonSpacing.md,
    },
    filterChipText: {
      fontSize: CarbonTypography.caption.fontSize,
      fontWeight: '500',
    },
    section: {
      gap: CarbonSpacing.md,
    },
    sectionTitle: {
      fontSize: CarbonTypography.body01.fontSize,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    orderCard: {
      borderWidth: 1,
      padding: CarbonSpacing.lg,
      gap: CarbonSpacing.md,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    orderNumber: {
      fontSize: CarbonTypography.caption.fontSize,
      fontFamily: 'Courier',
      fontWeight: '700',
    },
    styleName: {
      fontSize: CarbonTypography.body02.fontSize,
      fontWeight: '600',
      marginTop: 2,
    },
    statusBadge: {
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    orderDivider: {
      height: 1,
    },
    orderMetaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: CarbonSpacing.md,
    },
    metaItem: {
      width: '46%',
    },
    metaLabel: {
      fontSize: CarbonTypography.caption.fontSize,
    },
    metaValue: {
      fontSize: CarbonTypography.body01.fontSize,
      marginTop: 2,
    },
    metaValueHighlight: {
      fontSize: CarbonTypography.body01.fontSize,
      fontWeight: '600',
      marginTop: 2,
    },
    metaValueMono: {
      fontSize: CarbonTypography.caption.fontSize,
      fontFamily: 'Courier',
      marginTop: 2,
    },
    carbonPrimaryButton: {
      paddingVertical: CarbonSpacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: CarbonSpacing.sm,
    },
    carbonButtonText: {
      fontSize: CarbonTypography.body01.fontSize,
      fontWeight: '600',
    },
    updateStatusBar: {
      padding: CarbonSpacing.sm,
      borderLeftWidth: 3,
    },
    updateStatusText: {
      fontSize: CarbonTypography.caption.fontSize,
      fontFamily: 'Courier',
    },
  });
}
