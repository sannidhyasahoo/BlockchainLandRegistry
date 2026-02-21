/**
 * components/PropertyCard.jsx
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { fetchMetadata, ipfsToHttp } from "../utils/contract";
import { ethers } from "ethers";

export default function PropertyCard({ property }) {
  const [meta, setMeta] = useState(null);
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const basePath = role === "registrar" ? "/registrar-dashboard" : "/user-dashboard";

  useEffect(() => {
    if (property.uri) {
      fetchMetadata(property.uri).then(setMeta);
    }
  }, [property.uri]);

  const priceEth = ethers.formatEther(property.price || "0");
  const imageUrl = meta?.image ? ipfsToHttp(meta.image) : null;
  const short = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "—";

  return (
    <div className="property-card" onClick={() => navigate(`${basePath}/property/${property.tokenId}`)}>
      <div className="card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={meta?.name || "Property"} />
        ) : (
          <div className="card-image-placeholder">🏠</div>
        )}
        <StatusBadge status={property.status} />
      </div>

      <div className="card-body">
        <div className="card-title">{meta?.name || `Property #${property.tokenId}`}</div>
        <div className="card-desc">{meta?.description || "Loading metadata…"}</div>

        {meta?.attributes && (
          <div className="card-attrs">
            {meta.attributes.filter(a => !a.trait_type.includes("CID")).slice(0, 3).map((a) => (
              <span className="attr-chip" key={a.trait_type}>
                <strong>{a.value}</strong>
              </span>
            ))}
          </div>
        )}

        <div className="card-footer">
          <div>
            <span className="price-label">Price</span>
            <span className="price-value">{priceEth} POL</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="seller-label">Seller</span>
            <span className="seller-addr">{short(property.seller)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
