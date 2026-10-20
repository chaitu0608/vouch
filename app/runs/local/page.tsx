import ImportedRun from "@/components/ImportedRun";

export const metadata = {
  title: "Imported run",
  description:
    "A Vouch run loaded from a local JSON file. It stays in this browser.",
};

export default function LocalRunPage() {
  return <ImportedRun />;
}
