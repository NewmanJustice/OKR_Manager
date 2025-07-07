import * as React from "react";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

export interface Profession {
  id: number;
  roleName: string;
}

interface ProfessionSelectProps {
  professions: Profession[];
  value: string;
  onChange: (event: React.SyntheticEvent | null, value: string | null) => void;
}

export default function ProfessionSelect({ professions, value, onChange }: ProfessionSelectProps) {
  return (
    <Select
      name="professionId"
      value={value}
      onChange={onChange}
      required
      sx={{ mb: 2 }}
      placeholder="Select a profession"
    >
      {professions.map((prof) => (
        <Option key={prof.id} value={prof.id.toString()}>{prof.roleName}</Option>
      ))}
    </Select>
  );
}
