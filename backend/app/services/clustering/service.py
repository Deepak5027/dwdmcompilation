"""
K-Means Clustering and Model Evaluation Service.
"""

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler
from sqlalchemy.orm import Session

from app.models.clustering_result import ClusteringResult
from app.models.dim_destination import DimDestination
from app.models.fact_visitor_analytics import FactVisitorAnalytics
from app.repositories.clustering_repo import ClusteringRepository
from app.repositories.warehouse_repo import WarehouseRepository
from app.schemas.analytics import (
    ClusterAssignment,
    ClusteringExecutionResponse,
    ElbowPoint,
    PCAPoint,
)


class ClusteringService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ClusteringRepository(db)
        self.warehouse_repo = WarehouseRepository(db)

    def _prepare_destination_features(self) -> pd.DataFrame:
        """
        Aggregate multi-dimensional features per destination from the data warehouse.
        """
        destinations = self.warehouse_repo.get_destinations_list()

        rows = []
        for d in destinations:
            # Query aggregates for this destination
            facts = (
                self.db.query(FactVisitorAnalytics)
                .filter(FactVisitorAnalytics.destination_key == d.destination_key)
                .all()
            )

            if facts:
                avg_visitors = float(np.mean([f.visitor_count for f in facts]))
                avg_rating = float(np.mean([f.average_rating for f in facts]))
                total_reviews = float(sum([f.review_count for f in facts]))
                demand_score = float(np.mean([f.demand_measure for f in facts]))
            else:
                # Baseline defaults if unlinked
                avg_visitors = 12000.0
                avg_rating = 4.2
                total_reviews = 450.0
                demand_score = 65.0

            rows.append({
                "destination_id": d.destination_id,
                "destination_name": d.destination_name,
                "district": d.district,
                "tourism_category": d.tourism_category,
                "avg_visitors": avg_visitors,
                "avg_rating": avg_rating,
                "total_reviews": total_reviews,
                "demand_score": demand_score,
            })

        if not rows:
            # Demonstration baseline feature dataset for Tamil Nadu
            return self._get_fallback_dataframe()

        return pd.DataFrame(rows)

    def _get_fallback_dataframe(self) -> pd.DataFrame:
        data = [
            ("TN-CHE-01", "Marina Beach", "Chennai", "Beach", 45000.0, 4.3, 3200.0, 92.5),
            ("TN-MAM-01", "Shore Temple", "Chengalpattu", "Heritage", 28000.0, 4.6, 2400.0, 85.0),
            ("TN-NIL-01", "Ooty Lake & Peak", "Nilgiris", "Hill Station", 38000.0, 4.5, 3100.0, 89.0),
            ("TN-KOD-01", "Kodaikanal Pillar Rocks", "Dindigul", "Hill Station", 34000.0, 4.5, 2900.0, 86.4),
            ("TN-MDU-01", "Meenakshi Temple", "Madurai", "Temple", 42000.0, 4.9, 4500.0, 96.0),
            ("TN-RAM-01", "Ramanathaswamy Temple", "Ramanathapuram", "Pilgrimage", 36000.0, 4.7, 3400.0, 88.5),
            ("TN-KAN-01", "Vivekananda Rock", "Kanyakumari", "Coastal Heritage", 35000.0, 4.7, 3300.0, 87.2),
            ("TN-YER-01", "Yercaud Lake", "Salem", "Hill Station", 19000.0, 4.2, 1400.0, 68.0),
            ("TN-THA-01", "Brihadisvara Temple", "Thanjavur", "Heritage", 31000.0, 4.8, 3000.0, 89.2),
            ("TN-HOG-01", "Hogenakkal Falls", "Dharmapuri", "Waterfall", 24000.0, 4.4, 1800.0, 74.0),
            ("TN-PON-01", "Promenade Beach", "Puducherry Border", "Beach", 32000.0, 4.5, 2600.0, 81.0),
            ("TN-CHI-01", "Chidambaram Nataraja", "Cuddalore", "Temple", 22000.0, 4.6, 1700.0, 73.5),
            ("TN-COU-01", "Courtallam Main Falls", "Tenkasi", "Waterfall", 27000.0, 4.4, 2100.0, 77.0),
            ("TN-COO-01", "Sims Park Coonoor", "Nilgiris", "Nature", 18000.0, 4.3, 1300.0, 66.0),
            ("TN-VAL-01", "Valparai Tea Valleys", "Coimbatore", "Hill Station", 15000.0, 4.4, 1100.0, 62.0),
            ("TN-MUD-01", "Mudumalai Tiger Reserve", "Nilgiris", "Wildlife", 16000.0, 4.5, 1250.0, 65.5),
            ("TN-DHA-01", "Dhanushkodi Ghost Town", "Ramanathapuram", "Coastal Heritage", 21000.0, 4.6, 1950.0, 76.0),
            ("TN-PIC-01", "Pichavaram Mangroves", "Cuddalore", "Eco-Tourism", 17500.0, 4.4, 1400.0, 67.2),
            ("TN-YEL-01", "Yelagiri Nature Park", "Tirupathur", "Hill Station", 14000.0, 4.1, 950.0, 58.0),
            ("TN-VED-01", "Vedanthangal Sanctuary", "Chengalpattu", "Wildlife", 13000.0, 4.3, 850.0, 56.4),
        ]
        return pd.DataFrame(
            data,
            columns=[
                "destination_id",
                "destination_name",
                "district",
                "tourism_category",
                "avg_visitors",
                "avg_rating",
                "total_reviews",
                "demand_score",
            ],
        )

    def calculate_elbow(
        self, feature_keys: Optional[List[str]] = None, max_k: int = 8
    ) -> List[ElbowPoint]:
        df = self._prepare_destination_features()
        keys = feature_keys or ["avg_visitors", "avg_rating", "total_reviews", "demand_score"]
        X = df[keys].values

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        elbow_points = []
        for k in range(2, min(max_k + 1, len(df))):
            km = KMeans(n_clusters=k, init="k-means++", n_init=10, random_state=42)
            km.fit(X_scaled)
            elbow_points.append(ElbowPoint(k=k, inertia=round(float(km.inertia_), 2)))

        return elbow_points

    def execute_clustering(
        self,
        k_value: int = 3,
        features: Optional[List[str]] = None,
        max_iter: int = 300,
        random_state: int = 42,
    ) -> ClusteringExecutionResponse:
        df = self._prepare_destination_features()
        feature_cols = features or ["avg_visitors", "avg_rating", "total_reviews", "demand_score"]

        X = df[feature_cols].values

        # 1. Standardization
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # 2. K-Means Algorithm execution
        kmeans = KMeans(
            n_clusters=k_value,
            init="k-means++",
            max_iter=max_iter,
            n_init=15,
            random_state=random_state,
        )
        labels = kmeans.fit_predict(X_scaled)
        inertia = float(kmeans.inertia_)
        silhouette = float(silhouette_score(X_scaled, labels)) if k_value > 1 else 0.0

        # 3. PCA 2D Dimensionality Reduction for Planar Scatter Plotting
        pca = PCA(n_components=2, random_state=random_state)
        pca_transformed = pca.fit_transform(X_scaled)

        # 4. Generate cluster interpretations strictly derived from centroid characteristics
        centroids_unscaled = scaler.inverse_transform(kmeans.cluster_centers_)
        cluster_labels = []

        for idx, center in enumerate(centroids_unscaled):
            visitors_c = center[0]
            rating_c = center[1]
            if visitors_c > 35000:
                label = f"Cluster {idx}: High-Demand Flagship Destinations"
            elif rating_c >= 4.5 and visitors_c <= 25000:
                label = f"Cluster {idx}: Emerging High-Rating Eco/Heritage"
            elif visitors_c > 20000:
                label = f"Cluster {idx}: Moderate Demand Seasonal Hubs"
            else:
                label = f"Cluster {idx}: Niche & Developing Attractions"
            cluster_labels.append(label)

        # 5. Build PCA points & assignments
        pca_points: List[PCAPoint] = []
        assignments: List[ClusterAssignment] = []
        cluster_sizes: Dict[str, int] = {lbl: 0 for lbl in cluster_labels}

        for i, row in df.iterrows():
            cid = int(labels[i])
            clabel = cluster_labels[cid]
            cluster_sizes[clabel] = cluster_sizes.get(clabel, 0) + 1

            pca_points.append(
                PCAPoint(
                    destination_id=str(row["destination_id"]),
                    destination_name=str(row["destination_name"]),
                    pca_x=round(float(pca_transformed[i, 0]), 3),
                    pca_y=round(float(pca_transformed[i, 1]), 3),
                    cluster_id=cid,
                    cluster_label=clabel,
                )
            )

            assignments.append(
                ClusterAssignment(
                    destination_id=str(row["destination_id"]),
                    destination_name=str(row["destination_name"]),
                    district=str(row["district"]),
                    tourism_category=str(row["tourism_category"]),
                    cluster_id=cid,
                    cluster_label=clabel,
                    features={f: round(float(row[f]), 2) for f in feature_cols},
                )
            )

        # Build centroids record
        centroids_list = []
        for c in centroids_unscaled:
            centroids_list.append({f: round(float(val), 2) for f, val in zip(feature_cols, c)})

        # 6. Persist Execution Record in DB
        result_record = ClusteringResult(
            name=f"K-Means (k={k_value}) on {len(df)} Destinations",
            k_value=k_value,
            features_used=json.dumps(feature_cols),
            inertia=round(inertia, 2),
            silhouette_score=round(silhouette, 4),
            cluster_centers=json.dumps(centroids_list),
            cluster_assignments=json.dumps([a.model_dump() for a in assignments]),
            cluster_labels=json.dumps(cluster_labels),
            pca_data=json.dumps([p.model_dump() for p in pca_points]),
            elbow_data=json.dumps([e.model_dump() for e in self.calculate_elbow(feature_cols)]),
            config=json.dumps({"max_iter": max_iter, "random_state": random_state}),
        )
        saved = self.repo.save_result(result_record)

        return ClusteringExecutionResponse(
            id=saved.id,
            k_value=k_value,
            inertia=round(inertia, 2),
            silhouette_score=round(silhouette, 4),
            cluster_labels=cluster_labels,
            cluster_sizes=cluster_sizes,
            cluster_centroids=centroids_list,
            pca_points=pca_points,
            assignments=assignments,
            features_used=feature_cols,
            created_at=saved.created_at,
        )

