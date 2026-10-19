'use client';

import React, { useState, useEffect } from 'react';
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  Grid,
  Column,
  Tile,
  Button,
  Tag,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Content,
  ProgressBar,
  Theme,
} from '@carbon/react';
import {
  Dashboard,
  Box,
  Catalog,
  Settings,
  CheckmarkFilled,
  User,
  Sun,
  Asleep,
} from '@carbon/icons-react';

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

export default function Home() {
  const [rows] = useState<OrderRow[]>(INITIAL_ROWS);
  const [activeTab, setActiveTab] = useState('orders');
  const [theme, setTheme] = useState<'g100' | 'white'>('g100');
  const [apiHealth, setApiHealth] = useState<'checking' | 'online' | 'offline'>('checking');
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkApi = async () => {
      const start = Date.now();
      try {
        const res = await fetch('http://localhost:4000/health');
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
    checkApi();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'g100' ? 'white' : 'g100';
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-carbon-theme', nextTheme);
      }
      return nextTheme;
    });
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'In Progress':
        return <Tag type="blue">{status}</Tag>;
      case 'Quality Check':
        return <Tag type="warm-gray">{status}</Tag>;
      case 'Pending':
        return <Tag type="cool-gray">{status}</Tag>;
      case 'Completed':
        return <Tag type="green">{status}</Tag>;
      default:
        return <Tag type="gray">{status}</Tag>;
    }
  };

  return (
    <Theme theme={theme}>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--cds-background)' }}>
        {/* Carbon UI Shell Header */}
        <Header aria-label="CobblERP Header" className="cobbl-header">
          <HeaderName href="#" prefix="CobblERP">
            [Footwear Manufacturing]
          </HeaderName>
          <HeaderNavigation aria-label="Navigation">
            <HeaderMenuItem
              href="#orders"
              isCurrentPage={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
            >
              Production Floor
            </HeaderMenuItem>
            <HeaderMenuItem
              href="#inventory"
              isCurrentPage={activeTab === 'inventory'}
              onClick={() => setActiveTab('inventory')}
            >
              Raw Materials & Leather
            </HeaderMenuItem>
            <HeaderMenuItem
              href="#styles"
              isCurrentPage={activeTab === 'styles'}
              onClick={() => setActiveTab('styles')}
            >
              Styles & BOM
            </HeaderMenuItem>
          </HeaderNavigation>
          <HeaderGlobalBar>
            {/* Theme Toggle Action */}
            <HeaderGlobalAction
              aria-label={`Switch to ${theme === 'g100' ? 'Light' : 'Dark'} Mode`}
              tooltipAlignment="end"
              onClick={toggleTheme}
            >
              {theme === 'g100' ? <Sun size={20} /> : <Asleep size={20} />}
            </HeaderGlobalAction>

            <HeaderGlobalAction aria-label="Dashboard" tooltipAlignment="end">
              <Dashboard size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction aria-label="Catalog" tooltipAlignment="end">
              <Catalog size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction aria-label="Settings" tooltipAlignment="end">
              <Settings size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction aria-label="Profile" tooltipAlignment="end">
              <User size={20} />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
        </Header>

        {/* Main Content using Carbon Grid */}
        <Content style={{ paddingTop: '5rem', minHeight: '100vh', backgroundColor: 'var(--cds-background)' }}>
          <Grid>
            {/* Executive Summary Bar */}
            <Column lg={16} md={8} sm={4}>
              <div className="cobbl-hero-tile">
                <Grid>
                  <Column lg={10} md={5} sm={4}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Tag type="cyan">
                        Carbon Theme: {theme === 'g100' ? 'Gray 100 (Dark)' : 'White (Light)'}
                      </Tag>
                      <Tag type={apiHealth === 'online' ? 'green' : 'red'}>
                        NestJS API: {apiHealth === 'online' ? `Online (${apiLatency}ms)` : 'Offline'}
                      </Tag>
                      <Tag type="purple">Standard React Native Mobile</Tag>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.75rem 0 0.25rem', color: 'var(--cds-text-primary)' }}>
                      CobblERP Manufacturing Execution System
                    </h1>
                    <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem', lineHeight: '1.25rem' }}>
                      End-to-end footwear production management: from clicking & cutting leather hides,
                      closing uppers, lasting, sole attaching, through to final quality inspection.
                    </p>
                  </Column>

                  <Column lg={6} md={3} sm={4}>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center', height: '100%' }}>
                      <Button
                        kind="tertiary"
                        size="md"
                        onClick={toggleTheme}
                        renderIcon={theme === 'g100' ? Sun : Asleep}
                      >
                        {theme === 'g100' ? 'Light Mode' : 'Dark Mode'}
                      </Button>
                      <Button kind="secondary" size="md" href="http://localhost:4000/users" target="_blank">
                        Inspect API
                      </Button>
                      <Button kind="primary" size="md" href="/api/users">
                        Query DB
                      </Button>
                    </div>
                  </Column>
                </Grid>
              </div>
            </Column>

            {/* Key Production Metrics (Carbon Tiles) */}
            <Column lg={4} md={2} sm={4} style={{ marginBottom: '1rem' }}>
              <Tile>
                <div className="cobbl-stat-label">Active Work Orders</div>
                <div className="cobbl-stat-number">14 Orders</div>
                <div style={{ marginTop: '0.5rem', color: 'var(--cds-support-success, #42be65)', fontSize: '0.75rem' }}>
                  +3 orders started today
                </div>
              </Tile>
            </Column>

            <Column lg={4} md={2} sm={4} style={{ marginBottom: '1rem' }}>
              <Tile>
                <div className="cobbl-stat-label">Pairs In Production</div>
                <div className="cobbl-stat-number">1,030 Pairs</div>
                <div style={{ marginTop: '0.5rem', color: 'var(--cds-interactive-01, #0f62fe)', fontSize: '0.75rem' }}>
                  78% factory capacity utilized
                </div>
              </Tile>
            </Column>

            <Column lg={4} md={2} sm={4} style={{ marginBottom: '1rem' }}>
              <Tile>
                <div className="cobbl-stat-label">Leather Inventory (Hides)</div>
                <div className="cobbl-stat-number">4,280 sq.ft</div>
                <div style={{ marginTop: '0.5rem', color: 'var(--cds-text-secondary)', fontSize: '0.75rem' }}>
                  Calf, Suede & Cordovan
                </div>
              </Tile>
            </Column>

            <Column lg={4} md={2} sm={4} style={{ marginBottom: '1rem' }}>
              <Tile>
                <div className="cobbl-stat-label">First-Pass Yield (QC)</div>
                <div className="cobbl-stat-number">98.4%</div>
                <div style={{ marginTop: '0.5rem', color: 'var(--cds-support-success, #42be65)', fontSize: '0.75rem' }}>
                  Within AQL 1.5 standard
                </div>
              </Tile>
            </Column>

            {/* Production Floor Pipeline Overview */}
            <Column lg={16} md={8} sm={4} style={{ marginBottom: '1.5rem' }}>
              <Tile>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--cds-text-primary)' }}>
                  Footwear Assembly Line Stages
                </h3>
                <Grid>
                  <Column lg={4} md={2} sm={2}>
                    <div style={{ borderLeft: '3px solid var(--cds-interactive-01, #0f62fe)', paddingLeft: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-placeholder)' }}>STAGE 1</div>
                      <div style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>Clicking / Cutting</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>Hide sorting & die cutting</div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <ProgressBar label="Capacity" value={85} size="small" />
                      </div>
                    </div>
                  </Column>

                  <Column lg={4} md={2} sm={2}>
                    <div style={{ borderLeft: '3px solid #009d9a', paddingLeft: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-placeholder)' }}>STAGE 2</div>
                      <div style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>Closing / Stitching</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>Skiving, lining & upper seam</div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <ProgressBar label="Capacity" value={92} size="small" />
                      </div>
                    </div>
                  </Column>

                  <Column lg={4} md={2} sm={2}>
                    <div style={{ borderLeft: '3px solid #8a3ffc', paddingLeft: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-placeholder)' }}>STAGE 3</div>
                      <div style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>Lasting & Welting</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>Toe lasting & Goodyear welt</div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <ProgressBar label="Capacity" value={74} size="small" />
                      </div>
                    </div>
                  </Column>

                  <Column lg={4} md={2} sm={2}>
                    <div style={{ borderLeft: '3px solid #42be65', paddingLeft: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-placeholder)' }}>STAGE 4</div>
                      <div style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>Bottoming & QC</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>Sole attaching & burnishing</div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <ProgressBar label="Capacity" value={90} size="small" />
                      </div>
                    </div>
                  </Column>
                </Grid>
              </Tile>
            </Column>

            {/* Active Work Orders DataTable */}
            <Column lg={16} md={8} sm={4} style={{ marginBottom: '2rem' }}>
              <DataTable rows={rows} headers={TABLE_HEADERS}>
                {({ rows: tableRows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                  <div style={{ backgroundColor: 'var(--cds-layer-01)', border: '1px solid var(--cds-border-subtle)' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--cds-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                          Live Factory Work Orders
                        </h3>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>
                          Track production lots from cutting room to final boxed footwear.
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
                                    {getStatusTag(cell.value)}
                                  </TableCell>
                                );
                              }
                              if (cell.info.header === 'orderNumber') {
                                return (
                                  <TableCell key={cell.id}>
                                    <span style={{ fontFamily: 'monospace', color: 'var(--cds-link-primary, #0f62fe)', fontWeight: 600 }}>
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

            {/* Architecture & Guidelines for Mobile and Web */}
            <Column lg={8} md={4} sm={4} style={{ marginBottom: '1.5rem' }}>
              <Tile>
                <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cds-text-primary)' }}>
                  <Box size={18} /> Standard React Native Mobile App
                </h4>
                <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.8125rem', lineHeight: '1.35rem' }}>
                  • Built with <strong>bare React Native 0.76+</strong> (not managed Expo).
                  <br />
                  • Dual-theme support: <strong>Gray 100 (Dark)</strong> &amp; <strong>White (Light)</strong>.
                  <br />
                  • Equipped with <code>expo-updates</code> solely for pushing over-the-air bundle updates to mobile barcode scanners and tablets.
                </p>
              </Tile>
            </Column>

            <Column lg={8} md={4} sm={4} style={{ marginBottom: '1.5rem' }}>
              <Tile>
                <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cds-text-primary)' }}>
                  <CheckmarkFilled size={18} /> Drizzle ORM + Neon Database
                </h4>
                <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.8125rem', lineHeight: '1.35rem' }}>
                  • Pre-configured schema for products, work orders, materials, and batch tracking.
                  <br />
                  • Instant serverless execution via <code>@neondatabase/serverless</code> HTTP driver.
                  <br />
                  • Direct sharing across Next.js and NestJS via <code>@repo/db</code> package.
                </p>
              </Tile>
            </Column>
          </Grid>
        </Content>
      </div>
    </Theme>
  );
}
