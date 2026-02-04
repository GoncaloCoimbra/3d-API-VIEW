interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = '', 
  title, 
  description 
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '300px',
      background: '#1a1a1a',
      borderRadius: '10px',
      border: '2px dashed #333'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>
        {icon}
      </div>
      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ color: '#888', fontSize: '14px', textAlign: 'center', maxWidth: '300px' }}>
        {description}
      </div>
    </div>
  );
};
