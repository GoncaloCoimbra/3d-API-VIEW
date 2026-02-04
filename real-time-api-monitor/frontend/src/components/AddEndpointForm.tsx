import React, { useState } from "react";
import "./AddEndpointForm.css";

interface AddEndpointFormProps {
  onClose: () => void;
  onSubmit: (endpointData: any) => void;
}

export default function AddEndpointForm({ onClose, onSubmit }: AddEndpointFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    method: "GET",
    interval: "30",
    timeout: "5000",
    tags: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const endpointData = {
      id: `ep-${Date.now()}`,
      name: formData.name,
      url: formData.url,
      method: formData.method,
      interval: parseInt(formData.interval),
      timeout: parseInt(formData.timeout),
      tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [],
      status: "online",
      responseTime: Math.floor(Math.random() * 100) + 50,
      uptime: 100,
      lastChecked: new Date().toISOString(),
      lastStatus: 200
    };

    onSubmit(endpointData);
    onClose();
  };

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-panel" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h3>Add New API Endpoint</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <label>Endpoint Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My API Service"
              required
            />
          </div>

          <div className="form-group">
            <label>URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://api.example.com/health"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Method</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="HEAD">HEAD</option>
              </select>
            </div>

            <div className="form-group">
              <label>Check Interval (s)</label>
              <select
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
              >
                <option value="10">10s</option>
                <option value="30">30s</option>
                <option value="60">1m</option>
                <option value="300">5m</option>
                <option value="600">10m</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Timeout (ms)</label>
              <input
                type="number"
                value={formData.timeout}
                onChange={(e) => setFormData({ ...formData, timeout: e.target.value })}
                placeholder="5000"
                min="1000"
                max="30000"
                required
              />
            </div>

            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="production, api, monitoring"
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Add Endpoint
          </button>
        </form>
      </div>
    </div>
  );
}