type JsonLdProps = {
  data: unknown;
  id?: string;
};

export default function JsonLd({
  data,
  id = "structured-data",
}: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
