import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Papa from "papaparse";
import Select from "react-select";

const App: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>(
    {}
  );
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    fetchCSVData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedFilters]);

  const fetchCSVData = () => {
    fetch("/dataset_large.csv")
      .then((response) => response.text())
      .then((csvData) => {
        const parsedData: any[] = Papa.parse(csvData, { header: true }).data;
        const dataWithIds = parsedData.map((row, index) => ({
          ...row,
          id: index,
        }));
        if (Object.keys(filters).length === 0) {
          Object.keys(dataWithIds[0]).forEach((key) => {
            if (key !== "id" && key !== "number") {
              const uniqueValueForThisKey = new Set();
              dataWithIds.forEach((data) => {
                if (data[key]) {
                  uniqueValueForThisKey.add(data[key]);
                }
              });

              const options = Array.from(uniqueValueForThisKey)
                .sort()
                .map((value) => ({
                  label: value,
                  value: value,
                }));
              setFilters((prevFilters) => {
                return {
                  ...prevFilters,
                  [key]: options,
                };
              });
            }
          });
        }
        setData(dataWithIds);
      });
  };

  const columns: GridColDef[] =
    data.length > 0
      ? Object.keys(data[0])
          .filter((key) => key !== "id")
          .map((key) => ({
            field: key,
            headerName: key.toUpperCase(),
            width: 150,
            flex: 1,
            sortable: true,
            headerAlign: "center",
            align: "center",
          }))
      : [];

  columns.unshift({
    field: "id",
    headerName: "ID",
    width: 150,
    flex: 1,
    sortable: true,
    headerAlign: "center",
    align: "center",
  });

  const applyFilters = () => {
    console.log(selectedFilters);
    let filtersCleared = true;
    Object.values(selectedFilters).forEach((value) => {
      if (value) {
        filtersCleared = false;
        return;
      }
    });
    console.log(filtersCleared);

    let updatedData = data;
    let selectedDataIDs = [];
    Object.keys(selectedFilters).forEach((key) => {
      if (selectedFilters[key]) {
        updatedData = updatedData.filter((row) => {
          return selectedFilters[key] === row[key];
        });
      }
    });
    if (updatedData.length < data.length) {
      selectedDataIDs = updatedData.map((data) => {
        return data.id;
      });

      if (!filtersCleared) {
        Object.keys(updatedData[0]).forEach((key) => {
          if (key !== "id" && key !== "number") {
            const uniqueValueForThisKey = new Set();
            updatedData.forEach((data) => {
              if (data[key]) {
                uniqueValueForThisKey.add(data[key]);
              }
            });

            const options = Array.from(uniqueValueForThisKey)
              .sort()
              .map((value) => ({
                label: value,
                value: value,
              }));

            setFilters((prevFilters) => ({
              ...prevFilters,
              [key]: options,
            }));
          }
        });
      } else {
        Object.keys(data[0]).forEach((key) => {
          if (key !== "id" && key !== "number") {
            const uniqueValueForThisKey = new Set();
            data.forEach((data) => {
              if (data[key]) {
                uniqueValueForThisKey.add(data[key]);
              }
            });

            const options = Array.from(uniqueValueForThisKey)
              .sort()
              .map((value) => ({
                label: value,
                value: value,
              }));
            setFilters((prevFilters) => {
              return {
                ...prevFilters,
                [key]: options,
              };
            });
          }
        });
      }
    }
    setFilteredData(selectedDataIDs);
  };

  return (
    <div>
      {data.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              margin: "10px",
            }}
          >
            {Object.keys(filters).map((filter) => {
              return (
                <div style={{ margin: "0 10px" }} key={filter}>
                  <Select
                    options={filters[filter]}
                    isClearable // Add the isClearable prop to make the options clearable
                    placeholder={`Select ${filter}`}
                    onChange={(selectedOption: any) => {
                      setSelectedFilters((prev) => {
                        return {
                          ...prev,
                          [filter]: selectedOption
                            ? selectedOption.value
                            : null, // Set to null when no option is selected
                        };
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
          <DataGrid
            sx={{ width: "calc(100% - 20px)" }} // Adjust the width to remove extra space
            rows={data}
            autoHeight
            columns={columns.map((column) => ({
              ...column,
              renderCell: (params) => {
                return (
                  <div
                    style={{
                      backgroundColor:
                        filteredData.includes(params.id) &&
                        selectedFilters[column.field] &&
                        selectedFilters[column.field] === params.value
                          ? "green"
                          : "white",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    {params.value}
                  </div>
                );
              },
            }))}
            pagination
            pageSizeOptions={[20, 25, 50, 100]}
            getRowId={(row) => row.id}
            disableColumnMenu
          />
        </div>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default App;
