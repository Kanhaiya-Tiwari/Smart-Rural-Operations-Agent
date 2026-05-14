# Install Prometheus and Grafana using the kube-prometheus-stack helm chart
resource "helm_release" "prometheus_stack" {
  name             = "prometheus-stack"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  namespace        = "monitoring"
  create_namespace = true

  set {
    name  = "grafana.enabled"
    value = "true"
  }

  depends_on = [aws_eks_node_group.group_1, aws_eks_node_group.group_2]
}

# Install ArgoCD for GitOps deployment
resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  namespace        = "argocd"
  create_namespace = true

  set {
    name  = "server.service.type"
    value = "LoadBalancer"
  }

  depends_on = [aws_eks_node_group.group_1, aws_eks_node_group.group_2]
}

# Install Nginx Ingress Controller for traffic routing
resource "helm_release" "nginx_ingress" {
  name             = "nginx-ingress"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = "ingress-nginx"
  create_namespace = true

  # Configure it to use AWS Network Load Balancer (NLB)
  set {
    name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-type"
    value = "nlb"
  }

  depends_on = [aws_eks_node_group.group_1, aws_eks_node_group.group_2]
}

# Install Cert-Manager for automatic SSL certificates
resource "helm_release" "cert_manager" {
  name             = "cert-manager"
  repository       = "https://charts.jetstack.io"
  chart            = "cert-manager"
  namespace        = "cert-manager"
  create_namespace = true

  # Crucial: This installs the Custom Resource Definitions (CRDs) required for ClusterIssuers
  set {
    name  = "installCRDs"
    value = "true"
  }

  depends_on = [aws_eks_node_group.group_1, aws_eks_node_group.group_2]
}

# Install Metrics Server for HPA and monitoring
resource "helm_release" "metrics_server" {
  name       = "metrics-server"
  repository = "https://kubernetes-sigs.github.io/metrics-server/"
  chart      = "metrics-server"
  namespace  = "kube-system"

  set {
    name  = "args"
    value = "{--kubelet-insecure-tls}"
  }

  depends_on = [aws_eks_node_group.group_1, aws_eks_node_group.group_2]
}
