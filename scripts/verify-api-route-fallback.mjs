import { discoverRoute } from "../client/src/services/routeService.ts";

const cases = [
  ["Delhi", "Jaipur", "Jaipur Blue Pottery"],
  ["Bengaluru", "Mysore", "Channapatna Toys"],
  ["Mumbai", "Ahmedabad", "Patan Patola"],
  ["Kolkata", "Varanasi", "Bankura Horse"],
  ["Chennai", "Madurai", "Kanchipuram Silk"],
  ["Srinagar", "Jammu", "Kashmiri Pashmina"],
];

for (const [origin, destination, expected] of cases) {
  const result = await discoverRoute(origin, destination);
  if (result.source !== "mock") throw new Error(`${origin} → ${destination} should use the unavailable-service fallback during local verification.`);
  if (result.experience.opportunities[0]?.title !== expected) throw new Error(`${origin} → ${destination}: expected ${expected}, received ${result.experience.opportunities[0]?.title}`);
  console.log(`PASS ${origin} → ${destination}: API attempted, fallback returned ${expected}`);
}
