import { useEffect, useMemo, useState } from "react";


const API_URL =
  "https://p01--vivid-backend--5ykddwtmxz7v.code.run";


export default function ProductsSection() {

  const [search, setSearch] = useState("");

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  useEffect(() => {

    fetchProducts();

  }, []);


  async function fetchProducts() {

    try {

      setLoading(true);

      setError("");

      const response = await fetch(
        `${API_URL}/products`
      );

      if (!response.ok) {

        throw new Error(
          "Failed to load products"
        );

      }

      const data =
        await response.json();

      setProducts(data);

    } catch (error) {

      console.error(
        "Failed to fetch products:",
        error
      );

      setError(
        "Failed to load products."
      );

    } finally {

      setLoading(false);

    }
  }


  // =========================================================
  // FILTER
  // =========================================================

  const filteredProducts = useMemo(() => {

    return products.filter((product) => {

      const text =
        `${product.name} ${product.description}`
          .toLowerCase();

      return text.includes(
        search.toLowerCase()
      );

    });

  }, [products, search]);


  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  async function deleteProduct(id) {

    const product =
      products.find(
        (item) => item.id === id
      );

    if (!product) {
      return;
    }


    const confirmed =
      window.confirm(
        `Delete "${product.name}" permanently?`
      );


    if (!confirmed) {
      return;
    }


    try {

      const response = await fetch(
        `${API_URL}/products/${id}`,
        {
          method: "DELETE",
        }
      );


      if (!response.ok) {

        const data =
          await response.json()
            .catch(() => null);

        throw new Error(
          data?.detail ||
          "Delete failed"
        );

      }


      // Remove from UI after
      // backend confirms deletion.

      setProducts(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id
          )
      );


    } catch (error) {

      console.error(
        "Failed to delete product:",
        error
      );

      alert(
        "Failed to delete product. Please try again."
      );

    }

  }


  // =========================================================
  // EDIT PRODUCT
  // =========================================================

  async function editProduct(product) {

    const name =
      window.prompt(
        "Product name:",
        product.name
      );

    if (name === null) {
      return;
    }


    const description =
      window.prompt(
        "Description:",
        product.description
      );

    if (description === null) {
      return;
    }


    const price =
      window.prompt(
        "Price:",
        product.price
      );

    if (price === null) {
      return;
    }


    const status =
      window.prompt(
        "Status (Active / Coming Soon):",
        product.status
      );

    if (status === null) {
      return;
    }


    try {

      const response = await fetch(
        `${API_URL}/products/${product.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            description,
            price,
            status,
            users: product.users,
          }),

        }
      );


      if (!response.ok) {

        const data =
          await response.json()
            .catch(() => null);

        throw new Error(
          data?.detail ||
          "Update failed"
        );

      }


      const updatedProduct =
        await response.json();


      setProducts(
        (current) =>
          current.map(
            (item) =>
              item.id === product.id
                ? updatedProduct
                : item
          )
      );


    } catch (error) {

      console.error(
        "Failed to update product:",
        error
      );

      alert(
        "Failed to update product."
      );

    }

  }


  // =========================================================
  // ADD PRODUCT
  // =========================================================

  async function addProduct() {

    const name =
      window.prompt(
        "Product name:"
      );

    if (!name) {
      return;
    }


    const description =
      window.prompt(
        "Product description:"
      );

    if (description === null) {
      return;
    }


    const price =
      window.prompt(
        "Product price:",
        "$0"
      );

    if (price === null) {
      return;
    }


    const status =
      window.prompt(
        "Status (Active / Coming Soon):",
        "Active"
      );

    if (status === null) {
      return;
    }


    try {

      const response = await fetch(
        `${API_URL}/products`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            description,
            price,
            status,
            users: 0,
          }),

        }
      );


      if (!response.ok) {

        const data =
          await response.json()
            .catch(() => null);

        throw new Error(
          data?.detail ||
          "Creation failed"
        );

      }


      const newProduct =
        await response.json();


      setProducts(
        (current) => [
          ...current,
          newProduct,
        ]
      );


    } catch (error) {

      console.error(
        "Failed to create product:",
        error
      );

      alert(
        "Failed to create product."
      );

    }

  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div
        style={{
          background: "#151b2d",
          borderRadius: "24px",
          padding: "60px",
          textAlign: "center",
          color: "#94a3b8",
        }}
      >
        Loading VIVID products...
      </div>
    );

  }


  // =========================================================
  // PAGE
  // =========================================================

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
          onClick={addProduct}
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


      {/* ERROR */}

      {error && (

        <div
          style={{
            marginBottom: "20px",
            padding: "14px 18px",
            borderRadius: "12px",
            background:
              "rgba(239,68,68,.08)",
            border:
              "1px solid rgba(239,68,68,.25)",
            color: "#f87171",
          }}
        >
          {error}
        </div>

      )}


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
          onChange={(e) =>
            setSearch(e.target.value)
          }
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
                product.status ===
                "Active"
            ).length
          }
        />


        <Stat
          title="Total Users"
          value={
            products.reduce(
              (total, product) =>
                total +
                Number(
                  product.users || 0
                ),
              0
            )
          }
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

        {filteredProducts.map(
          (product) => (

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
                    product.status ===
                    "Active"
                      ? "rgba(34,211,238,.1)"
                      : "rgba(250,204,21,.1)",
                  color:
                    product.status ===
                    "Active"
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
                    padding:
                      "8px 11px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>


                <button
                  type="button"
                  onClick={() =>
                    deleteProduct(
                      product.id
                    )
                  }
                  style={{
                    border:
                      "1px solid rgba(239,68,68,.3)",
                    background:
                      "rgba(239,68,68,.08)",
                    color: "#f87171",
                    borderRadius: "8px",
                    padding:
                      "8px 11px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>

              </div>

            </div>

          )
        )}


        {/* EMPTY STATE */}

        {filteredProducts.length ===
          0 && (

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

function Stat({
  title,
  value,
}) {

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