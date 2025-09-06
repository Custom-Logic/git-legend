
// documentations page

export default function DocPage({ params }: { params: { slug: string[] } }) {
  return (
    <div>
      <h1>Docs</h1>
      <p>Slug: {params.slug?.join('/') || 'index'}</p>
    </div>
  );
}
