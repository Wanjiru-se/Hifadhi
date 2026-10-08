/* Page title block with optional description, meta text and actions */
export default function PageHeader({ title, description, meta, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {(meta || actions) && (
        <div className="page-header-actions">
          {meta && <span className="page-header-meta">{meta}</span>}
          {actions}
        </div>
      )}
    </div>
  );
}
