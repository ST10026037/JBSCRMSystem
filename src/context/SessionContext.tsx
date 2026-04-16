/** Compatibility re-exports — auth lives in AuthContext. */
export {
  AuthProvider as SessionProvider,
  useAuth,
  useSession,
} from './AuthContext'
