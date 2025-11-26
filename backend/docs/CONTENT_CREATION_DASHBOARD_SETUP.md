# Content Creation Engine Dashboard Setup

## Overview

This document provides instructions for setting up monitoring dashboards for the ScrollUniversity Content Creation Engine using Grafana, Prometheus, and custom metrics.

## Prerequisites

- Grafana 9.0+
- Prometheus 2.40+
- Access to ScrollUniversity production environment
- Admin credentials for Grafana

## Dashboard Components

### 1. Content Generation Overview Dashboard

**Purpose**: High-level view of content generation operations

**Metrics**:
- Total jobs processed (counter)
- Jobs per hour (rate)
- Success rate (percentage)
- Average processing time (histogram)
- Total cost (counter)
- Queue depth (gauge)

**Panels**:

#### Jobs Overview
```json
{
  "title": "Content Generation Jobs",
  "type": "stat",
  "targets": [
    {
      "expr": "content_creation_jobs_total",
      "legendFormat": "Total Jobs"
    },
    {
      "expr": "content_creation_jobs_completed_total",
      "legendFormat": "Completed"
    },
    {
      "expr": "content_creation_jobs_failed_total",
      "legendFormat": "Failed"
    }
  ]
}
```

#### Processing Time
```json
{
  "title": "Average Processing Time",
  "type": "graph",
  "targets": [
    {
      "expr": "rate(content_creation_processing_time_sum[5m]) / rate(content_creation_processing_time_count[5m])",
      "legendFormat": "Avg Processing Time (ms)"
    }
  ],
  "yaxes": [
    {
      "format": "ms"
    }
  ]
}
```

#### Queue Depth
```json
{
  "title": "Job Queue Depth",
  "type": "graph",
  "targets": [
    {
      "expr": "content_creation_queue_depth",
      "legendFormat": "Queue Depth"
    }
  ],
  "alert": {
    "conditions": [
      {
        "evaluator": {
          "params": [50],
          "type": "gt"
        },
        "operator": {
          "type": "and"
        },
        "query": {
          "params": ["A", "5m", "now"]
        },
        "reducer": {
          "params": [],
          "type": "avg"
        },
        "type": "query"
      }
    ],
    "name": "High Queue Depth Alert"
  }
}
```

### 2. Quality Metrics Dashboard

**Purpose**: Monitor content quality and pedagogy compliance

**Metrics**:
- Average quality score (gauge)
- Average pedagogy score (gauge)
- Quality gate failures (counter)
- Content by type (pie chart)

**Panels**:

#### Quality Scores
```json
{
  "title": "Content Quality Scores",
  "type": "gauge",
  "targets": [
    {
      "expr": "content_creation_quality_score_avg",
      "legendFormat": "Quality Score"
    },
    {
      "expr": "content_creation_pedagogy_score_avg",
      "legendFormat": "Pedagogy Score"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "min": 0,
      "max": 100,
      "thresholds": {
        "mode": "absolute",
        "steps": [
          {
            "color": "red",
            "value": 0
          },
          {
            "color": "yellow",
            "value": 70
          },
          {
            "color": "green",
            "value": 80
          }
        ]
      }
    }
  }
}
```

#### Quality Gate Failures
```json
{
  "title": "Quality Gate Failures",
  "type": "graph",
  "targets": [
    {
      "expr": "rate(content_creation_quality_gate_failures_total[5m])",
      "legendFormat": "Failures per minute"
    }
  ]
}
```

### 3. Cost Monitoring Dashboard

**Purpose**: Track AI costs and budget compliance

**Metrics**:
- Total cost (counter)
- Cost per job (histogram)
- Cost by model (breakdown)
- Budget utilization (gauge)

**Panels**:

#### Cost Overview
```json
{
  "title": "AI Cost Overview",
  "type": "stat",
  "targets": [
    {
      "expr": "content_creation_cost_total",
      "legendFormat": "Total Cost ($)"
    },
    {
      "expr": "content_creation_cost_total / content_creation_jobs_completed_total",
      "legendFormat": "Avg Cost per Job ($)"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "currencyUSD"
    }
  }
}
```

#### Budget Utilization
```json
{
  "title": "Daily Budget Utilization",
  "type": "gauge",
  "targets": [
    {
      "expr": "(content_creation_cost_daily / content_creation_budget_daily) * 100",
      "legendFormat": "Budget Used (%)"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "min": 0,
      "max": 100,
      "thresholds": {
        "mode": "absolute",
        "steps": [
          {
            "color": "green",
            "value": 0
          },
          {
            "color": "yellow",
            "value": 80
          },
          {
            "color": "red",
            "value": 95
          }
        ]
      }
    }
  }
}
```

### 4. Performance Dashboard

**Purpose**: Monitor system performance and resource utilization

**Metrics**:
- CPU usage (gauge)
- Memory usage (gauge)
- Throughput (rate)
- Latency percentiles (histogram)

**Panels**:

#### System Resources
```json
{
  "title": "Resource Utilization",
  "type": "graph",
  "targets": [
    {
      "expr": "rate(process_cpu_seconds_total{job=\"content-creation\"}[5m]) * 100",
      "legendFormat": "CPU %"
    },
    {
      "expr": "(process_resident_memory_bytes{job=\"content-creation\"} / 1024 / 1024)",
      "legendFormat": "Memory (MB)"
    }
  ]
}
```

#### Throughput
```json
{
  "title": "Job Throughput",
  "type": "graph",
  "targets": [
    {
      "expr": "rate(content_creation_jobs_completed_total[1h])",
      "legendFormat": "Jobs per hour"
    }
  ]
}
```

## Prometheus Configuration

### Metrics Endpoint

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'content-creation'
    scrape_interval: 30s
    static_configs:
      - targets: ['content-creation-service:9090']
    metrics_path: '/metrics'
```

### Custom Metrics

Expose these metrics from the Content Creation Service:

```typescript
// Counter metrics
content_creation_jobs_total
content_creation_jobs_completed_total
content_creation_jobs_failed_total
content_creation_quality_gate_failures_total

// Gauge metrics
content_creation_queue_depth
content_creation_quality_score_avg
content_creation_pedagogy_score_avg
content_creation_budget_utilization

// Histogram metrics
content_creation_processing_time_seconds
content_creation_cost_per_job_dollars

// Summary metrics
content_creation_tokens_used
```

## Alert Rules

### Prometheus Alert Rules

Create `content-creation-alerts.yml`:

```yaml
groups:
  - name: content_creation
    interval: 30s
    rules:
      # High queue depth
      - alert: HighQueueDepth
        expr: content_creation_queue_depth > 50
        for: 5m
        labels:
          severity: warning
          service: content-creation
        annotations:
          summary: "High content generation queue depth"
          description: "Queue depth is {{ $value }}, threshold is 50"

      # High error rate
      - alert: HighErrorRate
        expr: |
          (
            rate(content_creation_jobs_failed_total[5m]) /
            rate(content_creation_jobs_total[5m])
          ) > 0.05
        for: 5m
        labels:
          severity: critical
          service: content-creation
        annotations:
          summary: "High content generation error rate"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # Slow processing
      - alert: SlowProcessing
        expr: |
          (
            rate(content_creation_processing_time_sum[5m]) /
            rate(content_creation_processing_time_count[5m])
          ) > 300000
        for: 10m
        labels:
          severity: warning
          service: content-creation
        annotations:
          summary: "Slow content generation processing"
          description: "Average processing time is {{ $value }}ms"

      # High cost
      - alert: HighCost
        expr: rate(content_creation_cost_total[1h]) > 100
        for: 1h
        labels:
          severity: warning
          service: content-creation
        annotations:
          summary: "High AI cost rate"
          description: "Cost rate is ${{ $value }}/hour"

      # Budget exceeded
      - alert: BudgetExceeded
        expr: content_creation_cost_daily > content_creation_budget_daily
        for: 1m
        labels:
          severity: critical
          service: content-creation
        annotations:
          summary: "Daily budget exceeded"
          description: "Daily cost ${{ $value }} exceeds budget"

      # Low quality
      - alert: LowQualityScore
        expr: content_creation_quality_score_avg < 0.75
        for: 15m
        labels:
          severity: warning
          service: content-creation
        annotations:
          summary: "Low content quality scores"
          description: "Average quality score is {{ $value }}"
```

## Grafana Dashboard Import

### Import Dashboard JSON

1. Navigate to Grafana
2. Click "+" → "Import"
3. Upload dashboard JSON or paste dashboard ID
4. Select Prometheus data source
5. Click "Import"

### Dashboard IDs

- **Content Generation Overview**: `scrollu-content-gen-overview`
- **Quality Metrics**: `scrollu-content-quality`
- **Cost Monitoring**: `scrollu-content-cost`
- **Performance**: `scrollu-content-performance`

## Custom Visualizations

### Job Status Timeline

```json
{
  "title": "Job Status Timeline",
  "type": "state-timeline",
  "targets": [
    {
      "expr": "content_creation_job_status",
      "legendFormat": "{{job_id}}"
    }
  ],
  "options": {
    "showValue": "never",
    "rowHeight": 0.9,
    "mergeValues": true
  },
  "fieldConfig": {
    "defaults": {
      "mappings": [
        {
          "type": "value",
          "options": {
            "queued": {
              "color": "blue",
              "text": "Queued"
            },
            "processing": {
              "color": "yellow",
              "text": "Processing"
            },
            "completed": {
              "color": "green",
              "text": "Completed"
            },
            "failed": {
              "color": "red",
              "text": "Failed"
            }
          }
        }
      ]
    }
  }
}
```

### Cost Breakdown by Type

```json
{
  "title": "Cost by Content Type",
  "type": "piechart",
  "targets": [
    {
      "expr": "sum by (type) (content_creation_cost_by_type)",
      "legendFormat": "{{type}}"
    }
  ]
}
```

## Notification Channels

### Slack Integration

```yaml
# alertmanager.yml
receivers:
  - name: 'slack-content-creation'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#content-creation-alerts'
        title: 'Content Creation Alert'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

### Email Integration

```yaml
receivers:
  - name: 'email-ops'
    email_configs:
      - to: 'ops@scrolluniversity.com'
        from: 'alerts@scrolluniversity.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@scrolluniversity.com'
        auth_password: 'your-password'
```

### PagerDuty Integration

```yaml
receivers:
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: 'your-pagerduty-service-key'
        description: '{{ .CommonAnnotations.summary }}'
```

## Dashboard Access

### URLs

- **Production**: https://grafana.scrolluniversity.com/d/content-creation
- **Staging**: https://grafana-staging.scrolluniversity.com/d/content-creation

### Permissions

- **Viewers**: All authenticated users
- **Editors**: DevOps team, AI team
- **Admins**: Platform admins

## Maintenance

### Dashboard Updates

1. Export current dashboard JSON
2. Make modifications
3. Test in staging environment
4. Import to production
5. Document changes in version control

### Metric Retention

- **Short-term**: 15 days (1m resolution)
- **Medium-term**: 90 days (5m resolution)
- **Long-term**: 1 year (1h resolution)

## Troubleshooting

### Missing Metrics

1. Check Prometheus targets: http://prometheus:9090/targets
2. Verify metrics endpoint: http://content-creation-service:9090/metrics
3. Check service logs for errors
4. Verify Prometheus scrape configuration

### Dashboard Not Loading

1. Check Grafana logs
2. Verify data source connection
3. Test Prometheus queries directly
4. Check dashboard JSON for errors

### Incorrect Data

1. Verify metric calculations
2. Check time range selection
3. Verify Prometheus recording rules
4. Check for data gaps in Prometheus

## Additional Resources

- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [ScrollUniversity Monitoring Guide](./MONITORING_GUIDE.md)
- [Operations Runbook](./CONTENT_CREATION_OPERATIONS_RUNBOOK.md)

---

**Last Updated**: 2024-01-26
**Version**: 1.0
**Owner**: DevOps Team
