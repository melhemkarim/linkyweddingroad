import { Road } from "@/components/Road";
import { DateReveal } from "@/components/DateReveal";
import { DateDetails } from "@/components/DateDetails";
import { Places } from "@/components/Places";
import { Rsvp } from "@/components/Rsvp";
import { Wishes } from "@/components/Wishes";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <main>
      <Road />
      <DateReveal />
      <DateDetails />
      <Places />
      <Rsvp />
      <Wishes />
      <Footer />
    </main>
  );
}
