import { ButtonLink } from '../components/ui/Button';
import Placeholder from '../components/ui/Placeholder';

export default function NotFoundPage() {
  return (
    <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 16px' }}>
      <Placeholder
        icon="search"
        title="Page not found"
        action={
          <ButtonLink to="/dashboard" icon="home">
            Go to Dashboard
          </ButtonLink>
        }
      >
        The page you are looking for does not exist or has moved.
      </Placeholder>
    </div>
  );
}
