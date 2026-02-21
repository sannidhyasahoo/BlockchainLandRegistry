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

  useEffect(() => {
    if (property.uri) {
      fetchMetadata(property.uri).then(setMeta);
    }
  }, [property.uri]);

  const short = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "—";
  const imageUrl = meta?.image ? ipfsToHttp(meta.image) : null;

  return (
    <div className="property-card" onClick={() => navigate(`/dashboard/property/${property.tokenId}`)}>
      <div className="card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={meta?.name} onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <div className="card-image-placeholder">
            <span>🏠</span>
          </div>
        )}
        <StatusBadge status={property.status} />
      </div>

      <div className="card-body">
        <h3 className="card-title">{meta?.name ?? `Property #${property.tokenId}`}</h3>
        <p className="card-desc">{meta?.description ?? "Loading metadata…"}</p>

        {meta?.attributes && (
          <div className="card-attrs">
            {meta.attributes.slice(0, 3).map((a) => (
              <span className="attr-chip" key={a.trait_type}>
                <strong>{a.trait_type}:</strong> {a.value}
              </span>
            ))}
          </div>
        )}

        <div className="card-footer">
          <div className="card-price">
            <span className="price-label">Price</span>
            <span className="price-value">{property.priceEth} POL</span>
          </div>
          <div className="card-seller">
            <span className="seller-label">Seller</span>
            <span className="seller-addr">{short(property.seller)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
