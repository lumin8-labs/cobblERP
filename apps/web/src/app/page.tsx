'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Column,
  DataTable,
  Grid,
  InlineNotification,
  ProgressBar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  Tile,
  preview__IconIndicator as IconIndicator,
} from '@carbon/react';
import {
  Asleep,
  Box,
  CheckmarkFilled,
  Login,
  Settings,
  Sun,
  UserAvatar,
} from '@carbon/icons-react';
import { AppShell } from '@/components/AppShell';
import { useAppTheme } from '@/components/ThemeProvider';
import { useSession } from '@/lib/auth-client';

interface OrderRow {
  id: string;
  orderNumber: string;
  style: string;
  construction: string;
  pairs: number;
  stage: string;
  status: string;
  material: string;
}

const INITIAL_ROWS: OrderRow[] = [
  {
    id: '1',
    orderNumber: 'WO-2026-104',
    style: 'Oxford Brogue Derby',
    construction: 'Goodyear Welted',
    pairs: 120,
    stage: 'Lasting',
    status: 'In Progress',
    material: 'Full-Grain Calf (Black)',
  },
  {
    id: '2',
    orderNumber: 'WO-2026-105',
    style: 'Chelsea Boot Lug-42',
    construction: 'Vibram Lug Commando',
    pairs: 250,
    stage: 'Stitching',
    status: 'In Progress',
    material: 'Waterproof Suede (Dark Brown)',
  },
  {
    id: '3',
    orderNumber: 'WO-2026-106',
    style: 'Minimalist Court Low',
    construction: 'Cupsole Cemented',
    pairs: 400,
    stage: 'Cutting',
    status: 'Pending',
    material: 'Nappa Leather (White)',
  },
  {
    id: '4',
    orderNumber: 'WO-2026-107',
    style: 'Double Monk Strap',
    construction: 'Blake Stitched',
    pairs: 80,
    stage: 'Assembly',
    status: 'In Progress',
    material: 'Museum Calf (Burgundy)',
  },
  {
    id: '5',
    orderNumber: 'WO-2026-108',
    style: 'Combat Field Boot',
    construction: 'Storm Welted',
    pairs: 180,
    stage: 'QC Inspection',
    status: 'Quality Check',
    material: 'Waxed Roughout (Tan)',
  },
];

const TABLE_HEADERS = [
  { key: 'orderNumber', header: 'Work Order' },
  { key: 'style', header: 'Style / Model' },
  { key: 'construction', header: 'Construction' },
  { key: 'pairs', header: 'Batch (Pairs)' },
  { key: 'stage', header: 'Production Stage' },
  { key: 'status', header: 'Status' },
  { key: 'material', header: 'Upper Material' },
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const [rows] = useState<OrderRow[]>(INITIAL_ROWS);
  const { theme, toggleTheme } = useAppTheme();
  const { data: session } = useSession();
  const [apiHealth, setApiHealth] = useState<'checking' | 'online' | 'offline'>(
    'checking'
  );
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkApi = async () => {
      const start = Date.now();
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        if (res.ok) {
          setApiHealth('online');
          setApiLatency(Date.now() - start);
        } else {
          setApiHealth('offline');
        }
      } catch {
        setApiHealth('offline');
      }
    };
    void checkApi();
  }, []);

  const renderStatusIndicator = (status: string) => {
    switch (status) {
      case 'In Progress':
        return <IconIndicator kind="in-progress" label={status} />;
      case 'Quality Check':
        return <IconIndicator kind="caution-minor" label={status} />;
      case 'Pending':
        return <IconIndicator kind="pending" label={status} />;
      case 'Completed':
        return <IconIndicator kind="succeeded" label={status} />;
      default:
        return <IconIndicator kind="unknown" label={status} />;
    }
  };

  return (
    <AppShell>
      {/* Email verification prompt for signed-in but unverified operators */}
      {session?.user && !session.user.emailVerified ? (
        <Grid className="cobbl-grid-group">
          <Column sm={4} md={8} lg={16}>
            <InlineNotification
              kind="warning"
              role="status"
              title="Email verification pending"
              subtitle={`Verify ${session.user.email} with a 6-digit OTP to unlock full team access.`}
              hideCloseButton
            />
          </Column>
        </Grid>
      ) : null}

      {/* Executive Summary Bar */}
      <Grid className="cobbl-grid-group">
        <Column sm={4} md={8} lg={16}>
          <div className="cobbl-hero-tile">
            <Grid>
              <Column sm={4} md={5} lg={10}>
                <div className="cobbl-hero-meta">
                  <Tag type="cyan">
                    Carbon Theme: {theme === 'g100' ? 'Gray 100 (Dark)' : 'White (Light)'}
                  </Tag>
                  <IconIndicator
                    kind={
                      apiHealth === 'online'
                        ? 'succeeded'
                        : apiHealth === 'checking'
                          ? 'in-progress'
                          : 'failed'
                    }
                    label={
                      apiHealth === 'online'
                        ? `NestJS API Online (${apiLatency}ms)`
                        : apiHealth === 'checking'
                          ? 'Checking NestJS API'
                          : 'NestJS API Offline'
                    }
                  />
                  <Tag type="purple">Standard React Native Mobile</Tag>
                </div>

                <h1 className="cobbl-hero-title">
                  CobblERP Manufacturing Execution System
                </h1>
                <p className="cobbl-hero-subtitle">
                  End-to-end footwear production management: from clicking &amp;
                  cutting leather hides, closing uppers, lasting, sole
                  attaching, through to final quality inspection.
                </p>
              </Column>

              <Column sm={4} md={3} lg={6}>
                <div className="cobbl-hero-actions">
                  <Button
                    type="button"
                    kind="tertiary"
                    size="md"
                    onClick={toggleTheme}
                    renderIcon={theme === 'g100' ? Sun : Asleep}
                  >
                    {theme === 'g100' ? 'Light Mode' : 'Dark Mode'}
                  </Button>

                  {session?.user ? (
                    <Button
                      as={Link}
                      href="/settings"
                      kind="primary"
                      size="md"
                      renderIcon={Settings}
                    >
                      Profile &amp; Settings
                    </Button>
                  ) : (
                    <>
                      <Button
                        as={Link}
                        href="/sign-up"
                        kind="secondary"
                        size="md"
                        renderIcon={UserAvatar}
                      >
                        Create Account
                      </Button>
                      <Button
                        as={Link}
                        href="/sign-in"
                        kind="primary"
                        size="md"
                        renderIcon={Login}
                      >
                        Sign In
                      </Button>
                    </>
                  )}
                </div>
              </Column>
            </Grid>
          </div>
        </Column>
      </Grid>

      {/* Key Production Metrics */}
      <Grid narrow className="cobbl-grid-narrow">
        <Column sm={4} md={4} lg={4}>
          <Tile className="cobbl-metric-tile">
            <div className="cobbl-stat-label">Active Work Orders</div>
            <div className="cobbl-stat-number">14 Orders</div>
            <div className="cobbl-stat-caption-success">
              +3 orders started today
            </div>
          </Tile>
        </Column>

        <Column sm={4} md={4} lg={4}>
          <Tile className="cobbl-metric-tile">
            <div className="cobbl-stat-label">Pairs In Production</div>
            <div className="cobbl-stat-number">1,030 Pairs</div>
            <div className="cobbl-stat-caption-info">
              78% factory capacity utilized
            </div>
          </Tile>
        </Column>

        <Column sm={4} md={4} lg={4}>
          <Tile className="cobbl-metric-tile">
            <div className="cobbl-stat-label">Leather Inventory (Hides)</div>
            <div className="cobbl-stat-number">4,280 sq.ft</div>
            <div className="cobbl-stat-caption-muted">
              Calf, Suede &amp; Cordovan
            </div>
          </Tile>
        </Column>

        <Column sm={4} md={4} lg={4}>
          <Tile className="cobbl-metric-tile">
            <div className="cobbl-stat-label">First-Pass Yield (QC)</div>
            <div className="cobbl-stat-number">98.4%</div>
            <div className="cobbl-stat-caption-success">
              Within AQL 1.5 standard
            </div>
          </Tile>
        </Column>
      </Grid>

      {/* Production Floor Pipeline Overview */}
      <Grid className="cobbl-grid-group">
        <Column sm={4} md={8} lg={16}>
          <Tile>
            <h2 className="cobbl-section-heading">
              Footwear Assembly Line Stages
            </h2>
            <Grid>
              <Column sm={4} md={4} lg={4}>
                <div className="cobbl-stage-card">
                  <div className="cobbl-stage-eyebrow">STAGE 1</div>
                  <div className="cobbl-stage-title">Clicking / Cutting</div>
                  <p className="cobbl-body-muted">Hide sorting &amp; die cutting</p>
                  <div className="cobbl-stage-progress">
                    <ProgressBar label="Capacity" value={85} size="small" />
                  </div>
                </div>
              </Column>

              <Column sm={4} md={4} lg={4}>
                <div className="cobbl-stage-card cobbl-stage-card--teal">
                  <div className="cobbl-stage-eyebrow">STAGE 2</div>
                  <div className="cobbl-stage-title">Closing / Stitching</div>
                  <p className="cobbl-body-muted">Skiving, lining &amp; upper seam</p>
                  <div className="cobbl-stage-progress">
                    <ProgressBar label="Capacity" value={92} size="small" />
                  </div>
                </div>
              </Column>

              <Column sm={4} md={4} lg={4}>
                <div className="cobbl-stage-card cobbl-stage-card--purple">
                  <div className="cobbl-stage-eyebrow">STAGE 3</div>
                  <div className="cobbl-stage-title">Lasting &amp; Welting</div>
                  <p className="cobbl-body-muted">Toe lasting &amp; Goodyear welt</p>
                  <div className="cobbl-stage-progress">
                    <ProgressBar label="Capacity" value={74} size="small" />
                  </div>
                </div>
              </Column>

              <Column sm={4} md={4} lg={4}>
                <div className="cobbl-stage-card cobbl-stage-card--success">
                  <div className="cobbl-stage-eyebrow">STAGE 4</div>
                  <div className="cobbl-stage-title">Bottoming &amp; QC</div>
                  <p className="cobbl-body-muted">Sole attaching &amp; burnishing</p>
                  <div className="cobbl-stage-progress">
                    <ProgressBar label="Capacity" value={90} size="small" />
                  </div>
                </div>
              </Column>
            </Grid>
          </Tile>
        </Column>
      </Grid>

      {/* Active Work Orders DataTable */}
      <Grid className="cobbl-grid-group">
        <Column sm={4} md={8} lg={16}>
          <DataTable rows={rows} headers={TABLE_HEADERS}>
            {({ rows: tableRows, headers, getTableProps, getHeaderProps, getRowProps }) => (
              <div className="cobbl-table-shell">
                <div className="cobbl-table-header-bar">
                  <div>
                    <h2 className="cobbl-subsection-heading">
                      Live Factory Work Orders
                    </h2>
                    <p className="cobbl-body-muted">
                      Track production lots from cutting room to final boxed
                      footwear.
                    </p>
                  </div>
                  <Tag type="outline">Synchronized with Drizzle ORM</Tag>
                </div>
                <Table {...getTableProps()} aria-label="Footwear Production Table">
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })} key={header.key}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableRows.map((row) => (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        {row.cells.map((cell) => {
                          if (cell.info.header === 'status') {
                            return (
                              <TableCell key={cell.id}>
                                {renderStatusIndicator(String(cell.value))}
                              </TableCell>
                            );
                          }
                          if (cell.info.header === 'orderNumber') {
                            return (
                              <TableCell key={cell.id}>
                                <span className="cobbl-mono-code">
                                  {cell.value}
                                </span>
                              </TableCell>
                            );
                          }
                          return (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DataTable>
        </Column>
      </Grid>

      {/* Architecture & Guidelines */}
      <Grid className="cobbl-grid-group">
        <Column sm={4} md={4} lg={8}>
          <Tile className="cobbl-metric-tile">
            <h2 className="cobbl-subsection-heading">
              <span className="cobbl-inline-cluster">
                <Box size={18} aria-hidden="true" />
                <span>Standard React Native Mobile App</span>
              </span>
            </h2>
            <ul className="cobbl-bullet-list">
              <li>
                Built with <strong>bare React Native 0.76+</strong> (not managed
                Expo).
              </li>
              <li>
                Dual-theme support: <strong>Gray 100 (Dark)</strong> &amp;{' '}
                <strong>White (Light)</strong>.
              </li>
              <li>
                Equipped with <code>expo-updates</code> solely for over-the-air
                bundle updates on shop-floor scanners and tablets.
              </li>
            </ul>
          </Tile>
        </Column>

        <Column sm={4} md={4} lg={8}>
          <Tile className="cobbl-metric-tile">
            <h2 className="cobbl-subsection-heading">
              <span className="cobbl-inline-cluster">
                <CheckmarkFilled size={18} aria-hidden="true" />
                <span>Drizzle ORM + Better Auth + Neon DB</span>
              </span>
            </h2>
            <ul className="cobbl-bullet-list">
              <li>
                Multi-tenant factory schemas for products, work orders, and raw
                material inventory.
              </li>
              <li>
                Email OTP verification, password reset, bearer auth, and profile
                settings via <code>@repo/auth</code>.
              </li>
              <li>
                Shared database client across Next.js and NestJS via{' '}
                <code>@repo/db</code>.
              </li>
            </ul>
          </Tile>
        </Column>
      </Grid>
    </AppShell>
  );
}
