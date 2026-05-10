output "endpoint" {
  value = aws_eks_cluster.main.endpoint
}

output "kubeconfig-certificate-authority-data" {
  value = aws_eks_cluster.main.certificate_authority[0].data
}

output "vpc_id" {
  value = aws_vpc.main.id
}

# --- ArgoCD Credentials ---
data "kubernetes_secret" "argocd_password" {
  metadata {
    name      = "argocd-initial-admin-secret"
    namespace = "argocd"
  }
  depends_on = [helm_release.argocd]
}

output "argocd_admin_username" {
  value = "admin"
}

output "argocd_admin_password" {
  value     = data.kubernetes_secret.argocd_password.data["password"]
  sensitive = true
}

# --- Grafana Credentials ---
data "kubernetes_secret" "grafana_password" {
  metadata {
    name      = "prometheus-stack-grafana"
    namespace = "monitoring"
  }
  depends_on = [helm_release.prometheus_stack]
}

output "grafana_admin_username" {
  value = "admin"
}

output "grafana_admin_password" {
  value     = data.kubernetes_secret.grafana_password.data["admin-password"]
  sensitive = true
}

# --- Application Access URLs ---
data "kubernetes_ingress_v1" "ingress" {
  metadata {
    name      = "sroa-ingress"
    namespace = "sroa"
  }
  depends_on = [null_resource.deploy_k8s_manifests]
}

output "main_app_url" {
  value = "http://${data.kubernetes_ingress_v1.ingress.status[0].load_balancer[0].ingress[0].hostname}"
}

data "kubernetes_service_v1" "argocd" {
  metadata {
    name      = "argocd-server"
    namespace = "argocd"
  }
  depends_on = [helm_release.argocd]
}

output "argocd_url" {
  value = "http://${data.kubernetes_service_v1.argocd.status[0].load_balancer[0].ingress[0].hostname}"
}
