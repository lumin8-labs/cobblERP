'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Content,
  Header,
  HeaderContainer,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderName,
  HeaderNavigation,
  SideNav,
  SideNavItems,
  SideNavLink,
  SkipToContent,
} from '@carbon/react';
import {
  Asleep,
  Dashboard,
  Login,
  Logout,
  Settings,
  Sun,
  UserAvatar,
} from '@carbon/icons-react';
import { signOut, useSession } from '@/lib/auth-client';
import { useAppTheme } from './ThemeProvider';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useAppTheme();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
    router.refresh();
  };

  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <>
          <Header aria-label="CobblERP Navigation" className="cobbl-header">
            <SkipToContent href="#main-content" />
            <HeaderMenuButton
              aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
            />
            <HeaderName as={Link} href="/" prefix="CobblERP">
              [Footwear Manufacturing]
            </HeaderName>

            <HeaderNavigation aria-label="Primary navigation">
              <HeaderMenuItem as={Link} href="/" isCurrentPage={pathname === '/'}>
                Production Floor
              </HeaderMenuItem>
              {session?.user ? (
                <HeaderMenuItem
                  as={Link}
                  href="/settings"
                  isCurrentPage={pathname === '/settings' || pathname === '/profile'}
                >
                  Profile &amp; Settings
                </HeaderMenuItem>
              ) : (
                <>
                  <HeaderMenuItem
                    as={Link}
                    href="/sign-in"
                    isCurrentPage={pathname === '/sign-in'}
                  >
                    Sign In
                  </HeaderMenuItem>
                  <HeaderMenuItem
                    as={Link}
                    href="/sign-up"
                    isCurrentPage={pathname === '/sign-up'}
                  >
                    Create Account
                  </HeaderMenuItem>
                </>
              )}
            </HeaderNavigation>

            <HeaderGlobalBar>
              {session?.user ? (
                <div className="cobbl-user-chip" aria-label="Signed in operator">
                  {session.user.name || session.user.email}
                </div>
              ) : null}

              <HeaderGlobalAction
                aria-label={
                  theme === 'g100'
                    ? 'Switch to White Light Theme'
                    : 'Switch to Gray 100 Dark Theme'
                }
                tooltipAlignment="end"
                onClick={toggleTheme}
              >
                {theme === 'g100' ? <Sun size={20} /> : <Asleep size={20} />}
              </HeaderGlobalAction>

              {session?.user ? (
                <>
                  <HeaderGlobalAction
                    aria-label="Profile & Settings"
                    tooltipAlignment="end"
                    isActive={pathname === '/settings' || pathname === '/profile'}
                    onClick={() => router.push('/settings')}
                  >
                    <Settings size={20} />
                  </HeaderGlobalAction>
                  <HeaderGlobalAction
                    aria-label="Account Profile"
                    tooltipAlignment="end"
                    onClick={() => router.push('/settings?tab=profile')}
                  >
                    <UserAvatar size={20} />
                  </HeaderGlobalAction>
                  <HeaderGlobalAction
                    aria-label="Sign out"
                    tooltipAlignment="end"
                    onClick={handleSignOut}
                  >
                    <Logout size={20} />
                  </HeaderGlobalAction>
                </>
              ) : (
                <HeaderGlobalAction
                  aria-label="Sign in"
                  tooltipAlignment="end"
                  isActive={pathname === '/sign-in'}
                  onClick={() => router.push('/sign-in')}
                >
                  <Login size={20} />
                </HeaderGlobalAction>
              )}
            </HeaderGlobalBar>

            <SideNav
              aria-label="Side navigation"
              expanded={isSideNavExpanded}
              isPersistent={false}
              onOverlayClick={onClickSideNavExpand}
            >
              <SideNavItems>
                <SideNavLink
                  as={Link}
                  href="/"
                  renderIcon={Dashboard}
                  isActive={pathname === '/'}
                  onClick={onClickSideNavExpand}
                >
                  Production Floor
                </SideNavLink>

                {session?.user ? (
                  <>
                    <SideNavLink
                      as={Link}
                      href="/settings"
                      renderIcon={Settings}
                      isActive={pathname === '/settings' || pathname === '/profile'}
                      onClick={onClickSideNavExpand}
                    >
                      Profile &amp; Settings
                    </SideNavLink>
                    <SideNavLink
                      href="#sign-out"
                      renderIcon={Logout}
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                        e.preventDefault();
                        onClickSideNavExpand();
                        void handleSignOut();
                      }}
                    >
                      Sign Out
                    </SideNavLink>
                  </>
                ) : (
                  <>
                    <SideNavLink
                      as={Link}
                      href="/sign-in"
                      renderIcon={Login}
                      isActive={pathname === '/sign-in'}
                      onClick={onClickSideNavExpand}
                    >
                      Sign In
                    </SideNavLink>
                    <SideNavLink
                      as={Link}
                      href="/sign-up"
                      renderIcon={UserAvatar}
                      isActive={pathname === '/sign-up'}
                      onClick={onClickSideNavExpand}
                    >
                      Create Account
                    </SideNavLink>
                  </>
                )}
              </SideNavItems>
            </SideNav>
          </Header>

          <Content id="main-content" className="cobbl-content" tabIndex={-1}>
            <div>{children}</div>
          </Content>
        </>
      )}
    />
  );
}
