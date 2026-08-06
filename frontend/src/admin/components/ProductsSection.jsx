import { useMemo, useState } from "react";

export default function ProductsSection() {
  const [search, setSearch] = useState("");

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "VIVID Free",
      description: "Basic AI video editing",
      price: "$0",
      status: "Active",
      users: 124,
    },
    {
      id: 2,
      name: "VIVID Pro",
      description: "Advanced AI editing tools",
      price: "$19",
      status: "Active",
      users: 47,
    },
    {
      id: 3,
      name: "VIVID Creator",
      description: "Advanced creator workflow",
      price: "$39",
      status: "Coming Soon",
      users: 0,
    },
  ]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      `${product.name} ${product.description}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  function deleteProduct(id) {
    const product = products.find((item) => item.id === id);

    if (!product) return;

    const confirmed = window.confirm(
      `Delete "${product.name}"?`
    );

    if (!confirmed) return;

    setProducts((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function editProduct(product) {
    alert(
      `Edit product: ${product.name}\n\nProduct editor will be connected next.`
    );
  }

  return (
    <div>

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              color: "white",
              margin: 0,
              fontSize: "30px",
            }}
          >
            Products
          </h1>

          <p
            style={{
              color: "#94a3b8",
              margin: "8px 0 0",
            }}
          >
            Manage VIVID plans and products.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            alert("Product creation will be connected next.")
          }
          style={{
            border: "none",
            borderRadius: "12px",
            padding: "12px 18px",
            background:
              "linear-gradient(135deg,#22d3ee,#8b5cf6)",
            color: "white",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow:
              "0 8px 25px rgba(139,92,246,.25)",
          }}
        >
          + Add Product
        </button>
      </div>


      {/* SEARCH */}

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "#151b2d",
            border:
              "1px solid rgba(255,255,255,.1)",
            borderRadius: "12px",
            padding: "13px 16px",
            color: "white",
            outline: "none",
            fontSize: "14px",
          }}
        />
      </div>


      {/* STATS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: "18px",
          marginBottom: "25px",
        }}
      >
        <Stat
          title="Total Products"
          value={products.length}
        />

        <Stat
          title="Active Products"
          value={
            products.filter(
              (product) =>
                product.status === "Active"
            ).length
          }
        />

        <Stat
          title="Total Users"
          value={products.reduce(
            (total, product) =>
              total + product.users,
            0
          )}
        />
      </div>


      {/* PRODUCT TABLE */}

      <div
        style={{
          background: "#151b2d",
          borderRadius: "22px",
          border:
            "1px solid rgba(255,255,255,.08)",
          overflow: "hidden",
        }}
      >

        {/* TABLE HEADER */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1.5fr 2fr 1fr 1fr 1fr 1.3fr",
            gap: "15px",
            padding: "18px 22px",
            color: "#94a3b8",
            fontSize: "12px",
            fontWeight: "600",
            borderBottom:
              "1px solid rgba(255,255,255,.08)",
          }}
        >
          <span>PRODUCT</span>
          <span>DESCRIPTION</span>
          <span>PRICE</span>
          <span>STATUS</span>
          <span>USERS</span>
          <span>ACTIONS</span>
        </div>


        {/* PRODUCTS */}

        {filteredProducts.map((product) => (

          <div
            key={product.id}
            style={{
              display: "grid",
              gridTemplateColumns:
                "1.5fr 2fr 1fr 1fr 1fr 1.3fr",
              gap: "15px",
              alignItems: "center",
              padding: "20px 22px",
              color: "white",
              borderBottom:
                "1px solid rgba(255,255,255,.05)",
            }}
          >

            <strong>
              ✦ {product.name}
            </strong>

            <span
              style={{
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              {product.description}
            </span>

            <span
              style={{
                color: "#22d3ee",
                fontWeight: "700",
              }}
            >
              {product.price}
            </span>

            <span
              style={{
                display: "inline-flex",
                width: "fit-content",
                padding: "6px 10px",
                borderRadius: "8px",
                background:
                  product.status === "Active"
                    ? "rgba(34,211,238,.1)"
                    : "rgba(250,204,21,.1)",
                color:
                  product.status === "Active"
                    ? "#22d3ee"
                    : "#facc15",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              {product.status}
            </span>

            <span
              style={{
                color: "#cbd5e1",
              }}
            >
              {product.users}
            </span>

            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >

              <button
                type="button"
                onClick={() =>
                  editProduct(product)
                }
                style={{
                  border:
                    "1px solid rgba(34,211,238,.25)",
                  background:
                    "rgba(34,211,238,.08)",
                  color: "#22d3ee",
                  borderRadius: "8px",
                  padding: "8px 11px",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() =>
                  deleteProduct(product.id)
                }
                style={{
                  border:
                    "1px solid rgba(239,68,68,.3)",
                  background:
                    "rgba(239,68,68,.08)",
                  color: "#f87171",
                  borderRadius: "8px",
                  padding: "8px 11px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>

            </div>

          </div>

        ))}


        {/* EMPTY STATE */}

        {filteredProducts.length === 0 && (
          <div
            style={{
              padding: "60px",
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            No products found.
          </div>
        )}

      </div>

    </div>
  );
}


/* =========================================================
   STAT CARD
   ========================================================= */

function Stat({ title, value }) {
  return (
    <div
      style={{
        background: "#151b2d",
        borderRadius: "18px",
        padding: "22px",
        border:
          "1px solid rgba(255,255,255,.08)",
        boxShadow:
          "0 12px 30px rgba(0,0,0,.12)",
      }}
    >
      <div
        style={{
          color: "#94a3b8",
          fontSize: "13px",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "white",
          fontSize: "28px",
          fontWeight: "700",
        }}
      >
        {value}
      </div>
    </div>
  );
}