import type { Metadata } from "next";
import GeometryApp from "./components/GeometryApp";

export const metadata: Metadata = {
  title: "Geometria RPG · Academia Euclidiana",
  description: "Construa a teoria, prove os resultados e domine a geometria euclidiana.",
};

export default function Home() {
  return <GeometryApp />;
}
