import { Button } from "@/catalyst/button";
import { Heading, Subheading } from "@/catalyst/heading";

const HomePage = () => {
  return (
    <div className="flex flex-col gap-4">
      <Heading>Sick of opening many pages and dropdowns?</Heading>
      <p>
        Choose a sport and see all markets (with 3 or less options) and lines
      </p>
      <div>
        <Button to="/statement">Statement Creator</Button>
      </div>
    </div>
  );
};

export default HomePage;
