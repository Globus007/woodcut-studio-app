import { Printer } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "wouter";
import { Instruction } from "@/components/desk/Instruction";
import { Button } from "@/components/ui/button";
import {
  applyTemplate,
  evaluateChecks,
  hasRefuse,
  loadProject,
  loadUnit,
  STORAGE_KEY,
  UNIT_KEY,
} from "@/domain";

export default function InstructionPage() {
  const [, setLocation] = useLocation();
  const project = useMemo(
    () => loadProject(localStorage, STORAGE_KEY) ?? applyTemplate("stripes"),
    [],
  );
  const unit = useMemo(() => loadUnit(sessionStorage, UNIT_KEY), []);
  const refused = hasRefuse(evaluateChecks(project));

  return (
    <div className="sheet-page">
      <header className="sheet-chrome">
        <Button variant="outline" className="action-button" onClick={() => setLocation("/")}>
          К столу
        </Button>
        <div className="sheet-chrome-title">
          <span className="eyebrow">ЛИСТ</span>
          <b>{project.name}</b>
        </div>
        <Button className="accent-button" disabled={refused} onClick={() => window.print()}>
          <Printer size={15} /> Печать
        </Button>
      </header>
      <div className="sheet-stage">
        <Instruction project={project} unit={unit} />
      </div>
    </div>
  );
}
