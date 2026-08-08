import { DataGrid } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

export default function EmployeeGrid({ employees }) {
  const columns = [
    {
      field: "employee_id",
      headerName: "Employee ID",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1.5,
      valueGetter: (_, row) => `${row.first_name} ${row.last_name}`,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 2,
    },
    {
      field: "department",
      headerName: "Department",
      flex: 1,
      valueGetter: (_, row) => row.department || row.department_id,
    },
    {
      field: "designation",
      headerName: "Designation",
      flex: 2,
    },
    {
      field: "employment_status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "Active" ? "success" : "error"}
          size="small"
        />
      ),
    },
  ];

  const rows = employees.map((emp) => ({
    id: emp._id,
    ...emp,
  }));

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pageSizeOptions={[5, 10, 20]}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 5,
          },
        },
      }}
      autoHeight
    />
  );
}