/**
 * components/PropertyCard.jsx
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { fetchMetadata, ipfsToHttp } from "../utils/contract";
import { ethers } from "ethers";

export default function PropertyCard({ property, saleType = "sale" }) {
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
            <span className="price-label">{saleType === "lease" ? "Est. Rent" : "Price"}</span>
            <span className="price-value">{saleType === "lease" ? "Negotiable" : `${priceEth} POL`}</span>
          </div>
          <div style={{ textAlign: "right", display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            {property.partnership && (
              <span style={{ fontSize: '10px', background: 'var(--accent-1)', color: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Partnership</span>
            )}
            {property.lease && (
              <span style={{ fontSize: '10px', background: 'var(--purple)', color: 'var(--text-1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Active Lease</span>
            )}
            {!property.partnership && !property.lease && (
               <span className="seller-addr">{short(property.seller)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
