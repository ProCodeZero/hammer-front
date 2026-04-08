import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Heading from '../../components/Heading/Heading';
import styles from './NotFound.module.css';

interface NotFoundProps {
  message?: string;
}

export function NotFound({ message }: NotFoundProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.code}>404</div>
      <Heading level={1} className={styles.title}>
        {message || 'Page Not Found'}
      </Heading>
      <p className={styles.message}>
        {message
          ? message
          : "The unit, faction, or page you're looking for doesn't exist in the OpenHammer database."}
      </p>
      <div className={styles.actions}>
        <Button onClick={() => navigate(-1)}>← Go Back</Button>
        <Button appearance="outline" onClick={() => navigate('/')}>
          🏠 Home
        </Button>
        <Button appearance="ghost" onClick={() => navigate('/units')}>
          Browse Units
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
