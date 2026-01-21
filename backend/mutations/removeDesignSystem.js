import prisma from "../prisma/client.js";
async function removeDesignSystem(_, { id }) {
  const system = await prisma.designSystem.findUnique({
    where: { id: Number(id) },
  });
  if (!system) {
    throw new Error("Design System not found");
  }
  await prisma.designSystem.delete({ where: { id: Number(id) } });
  console.log(`Design System with ID ${id} has been removed.`);
  return id;
}
export default removeDesignSystem;
