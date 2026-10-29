import { usePalette } from '../theme/AppearanceProvider';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
  type ComponentRef,
} from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { BlurTargetView, BlurView } from 'expo-blur';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../features/auth/context/AuthContext';
import {
  profileName,
  profilePhoto,
} from '../features/profile/profileViewModel';
import { Avatar } from '../components/app/Avatar';
import { AppIcon, type AppIconName } from '../components/app/AppIcon';
import { CareBrand } from '../components/app/CareUI';
import { TouchTarget } from '../components/ui/TouchTarget';
import { fonts } from '../theme/tokens';

const sections = [
  {
    title: 'Arogio',
    links: [
      { title: 'Home', icon: 'home', route: '/home' },
      { title: 'Health', icon: 'heart', route: '/health' },
      { title: 'Jeeva AI', icon: 'goal', route: '/jeeva' },
      { title: 'Explore', icon: 'explore', route: '/explore' },
    ],
  },
  {
    title: 'Your care',
    links: [
      { title: 'Daily activity & targets', icon: 'trend', route: '/activity' },
      { title: 'Water', icon: 'drop', route: '/water' },
      { title: 'Medicines', icon: 'pill', route: '/medicines' },
      { title: 'Cycle tracking', icon: 'calendar', route: '/cycle' },
      { title: 'Connected health', icon: 'sync', route: '/connected-health' },
    ],
  },
  {
    title: 'Your account',
    links: [
      { title: 'Profile', icon: 'user', route: '/profile' },
      {
        title: 'Goals & preferences',
        icon: 'goal',
        route: '/edit-health-goals',
      },
      { title: 'Settings', icon: 'settings', route: '/settings' },
    ],
  },
] as const;
const SidebarContext = createContext<{
  openSidebar: () => void;
  isOpen: boolean;
}>({ openSidebar: () => {}, isOpen: false });
export const useSidebar = () => useContext(SidebarContext);
export function SidebarProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  return (
    <SidebarSession key={user?.id ?? 'signed-out'}>{children}</SidebarSession>
  );
}
function SidebarSession({ children }: PropsWithChildren) {
  const colors = usePalette();
  const s = useStyles();

  const { user, logout, isSubmitting } = useAuth();
  const { width } = useWindowDimensions(),
    insets = useSafeAreaInsets(),
    pathname = usePathname();
  const panelWidth = Math.min(344, width - 32);
  const [open, setOpen] = useState(false),
    [reduceMotion, setReduceMotion] = useState(true),
    [error, setError] = useState('');
  const [position] = useState(() => new Animated.Value(-panelWidth));
  const blurTarget = useRef<ComponentRef<typeof View> | null>(null);
  const closeLock = useRef(false),
    logoutLock = useRef(false);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (alive) setReduceMotion(value);
      })
      .catch(() => {});
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      alive = false;
      listener.remove();
      position.stopAnimation();
    };
  }, [position]);
  const openSidebar = useCallback(() => {
    if (!user) return;
    closeLock.current = false;
    setError('');
    position.setValue(-panelWidth);
    setOpen(true);
  }, [user, position, panelWidth]);
  useEffect(() => {
    if (!open) return;
    const animation = Animated.timing(position, {
      toValue: 0,
      duration: reduceMotion ? 0 : 200,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [open, position, reduceMotion, panelWidth]);
  useEffect(() => {
    if (!open) return;
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      closeSidebar(); return true;
    });
    return () => back.remove();
  });
  function closeSidebar(after?: () => void) {
    if (closeLock.current || logoutLock.current) return;
    closeLock.current = true;
    Animated.timing(position, {
      toValue: -panelWidth,
      duration: reduceMotion ? 0 : 160,
      useNativeDriver: true,
    }).start(({ finished }) => {
      closeLock.current = false;
      if (finished) {
        setOpen(false);
        after?.();
      }
    });
  }
  async function signOut() {
    if (isSubmitting || logoutLock.current) return;
    logoutLock.current = true;
    setError('');
    try {
      await logout();
    } catch {
      setError('Unable to log out. Please try again.');
    } finally {
      logoutLock.current = false;
    }
  }
  return (
    <SidebarContext.Provider value={{ openSidebar, isOpen: open }}>
      <View style={{ flex: 1 }}>
      <BlurTargetView ref={blurTarget} style={{ flex: 1 }} pointerEvents={open ? 'none' : 'auto'} accessibilityElementsHidden={open} importantForAccessibility={open ? 'no-hide-descendants' : 'auto'}>{children}</BlurTargetView>
      {open && Boolean(user) && <View style={s.overlay} accessibilityViewIsModal>
          <BlurView blurTarget={blurTarget} intensity={45} blurMethod="dimezisBlurView" tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close navigation menu"
            onPress={() => closeSidebar()}
            style={s.backdrop}
          />
          <Animated.View
            accessibilityViewIsModal
            onAccessibilityEscape={() => closeSidebar()}
            style={[
              s.panel,
              {
                width: panelWidth,
                paddingTop: Math.max(insets.top, 16),
                paddingBottom: Math.max(insets.bottom, 12),
                transform: [{ translateX: position }],
              },
            ]}
          >
            <View style={s.header}>
              <CareBrand />
              <TouchTarget
                accessibilityRole="button"
                accessibilityLabel="Close menu"
                disabled={isSubmitting}
                onPress={() => closeSidebar()}
                style={s.close}
              >
                <AppIcon name="close" />
              </TouchTarget>
            </View>
            {user && (
              <TouchTarget
                accessibilityRole="button"
                accessibilityLabel="Open your profile"
                onPress={() => closeSidebar(() => router.navigate('/profile'))}
                style={s.identity}
              >
                <Avatar photo={profilePhoto(user)} size={44} />
                <View style={s.flex}>
                  <Text style={s.name}>{profileName(user)}</Text>
                  <Text style={s.detail}>View your profile</Text>
                </View>
                <AppIcon name="right" size={18} />
              </TouchTarget>
            )}
            <ScrollView contentContainerStyle={s.links} bounces={false}>
              {sections.map((section) => (
                <View key={section.title} style={s.section}>
                  {section.title !== 'Arogio' && (
                    <Text style={s.sectionTitle}>{section.title}</Text>
                  )}
                  {section.links.map((link) => {
                    const active = pathname === link.route;
                    return (
                      <TouchTarget
                        key={link.route}
                        accessibilityRole="button"
                        accessibilityLabel={link.title}
                        accessibilityState={{
                          selected: active,
                          disabled: isSubmitting,
                        }}
                        disabled={isSubmitting}
                        onPress={() =>
                          closeSidebar(() => router.navigate(link.route))
                        }
                        style={({ pressed }) => [
                          s.link,
                          (active || pressed) && s.activeLink,
                        ]}
                      >
                        <AppIcon
                          name={link.icon as AppIconName}
                          filled={active}
                          size={22}
                        />
                        <Text style={[s.linkText, active && s.activeText]}>
                          {link.title}
                        </Text>
                      </TouchTarget>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
            <View style={s.footer}>
              {!!error && (
                <Text accessibilityRole="alert" style={s.error}>
                  {error}
                </Text>
              )}
              <TouchTarget
                accessibilityRole="button"
                accessibilityLabel="Log out"
                accessibilityState={{
                  disabled: isSubmitting,
                  busy: isSubmitting,
                }}
                disabled={isSubmitting}
                onPress={() => void signOut()}
                style={s.link}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <AppIcon name="logout" size={22} />
                )}
                <Text style={s.linkText}>
                  {isSubmitting ? 'Logging out...' : 'Log out'}
                </Text>
              </TouchTarget>
            </View>
          </Animated.View>
        </View>}
      </View>
    </SidebarContext.Provider>
  );
}
export function SidebarButton() {
  const colors = usePalette();
  const s = useStyles();

  const { openSidebar, isOpen } = useSidebar();
  return (
    <TouchTarget
      accessibilityRole="button"
      accessibilityLabel="Open navigation menu"
      accessibilityState={{ expanded: isOpen }}
      onPress={openSidebar}
      style={s.menu}
    >
      <AppIcon name="menu" color={colors.ink} size={24} />
    </TouchTarget>
  );
}
const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 100 },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 30, 24, 0.36)',
  },
  panel: {
    height: '100%',
    backgroundColor: colors.background,
    alignSelf: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 12,
    paddingVertical: 8,
  },
  close: { width: 48, alignItems: 'center', justifyContent: 'center' },
  menu: { width: 48, alignItems: 'center', justifyContent: 'center' },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  flex: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 25,
    color: colors.ink,
  },
  detail: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
    marginTop: 2,
  },
  links: { paddingHorizontal: 12, paddingBottom: 16 },
  section: { paddingTop: 20 },
  sectionTitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  link: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  linkText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 23,
    color: colors.ink,
  },
  activeLink: { backgroundColor: colors.subtle },
  activeText: { fontFamily: fonts.semibold, color: colors.primary },
  footer: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.error,
    paddingHorizontal: 12,
  },
});
};
