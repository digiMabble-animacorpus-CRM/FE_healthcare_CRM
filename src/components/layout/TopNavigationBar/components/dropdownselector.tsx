"use client";
import { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useRouter } from "next/navigation";
import "@/assets/scss/components/_dropdown-selector.scss";

const branches = [
  { label: "ALL Branch", path: "/branches/orneau" },
  { label: "Gembloux - Orneau", path: "/branches/orneau" },
  { label: "Gembloux - Tout Vent", path: "/branches/tout-vent" },
  { label: "Anima Corpus Namur", path: "/branches/anima-corpus" },
];

const dropdownselector = () => {
  const [selected, setSelected] = useState("Choose a branch");
  const router = useRouter();

  const handleSelect = (eventKey: string | null) => {
    const branch = branches.find((b) => b.label === eventKey);
    if (branch) {
      setSelected(branch.label);
      router.push(branch.path);
    }
  };

  return (
    <div className="dropdown-selector">
      <Dropdown onSelect={handleSelect}>
        <Dropdown.Toggle id="dropdown-basic">{selected}</Dropdown.Toggle>

        <Dropdown.Menu>
          {branches.map((branch) => (
            <Dropdown.Item key={branch.label} eventKey={branch.label}>
              {branch.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default dropdownselector;
