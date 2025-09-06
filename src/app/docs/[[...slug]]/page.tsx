/**
 * @file This file contains the documentation page component.
 * @exports default
 */

// documentations page

/**
 * A page component for displaying documentation.
 * @param {object} props - The props for the component.
 * @param {object} props.params - The parameters for the page.
 * @param {string[]} props.params.slug - The slug for the documentation page.
 * @returns {JSX.Element} The DocPage component.
 */
export default function DocPage({ params }: { params: { slug: string[] } }) {
  return (
    <div>
      <h1>Docs</h1>
      <p>Slug: {params.slug?.join('/') || 'index'}</p>
    </div>
  );
}
