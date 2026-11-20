'use client';

import React from 'react';
import { Column, Grid, Tile } from '@carbon/react';
import { AppShell } from './AppShell';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <AppShell>
      <Grid className="cobbl-grid-group">
        <Column
          sm={4}
          md={{ span: 6, offset: 1 }}
          lg={{ span: 8, offset: 4 }}
        >
          <Tile className="cobbl-auth-tile">
            <div className="cobbl-auth-header">
              <div className="cobbl-auth-eyebrow">{eyebrow}</div>
              <h1 className="cobbl-auth-title">{title}</h1>
              <p className="cobbl-auth-subtitle">{subtitle}</p>
            </div>

            <div>{children}</div>

            {footer ? <div className="cobbl-auth-footer">{footer}</div> : null}
          </Tile>
        </Column>
      </Grid>
    </AppShell>
  );
}
