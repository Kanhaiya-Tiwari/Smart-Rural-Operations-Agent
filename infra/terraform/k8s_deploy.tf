# This resource will automatically apply the Kubernetes manifests once the EKS nodes are ready
resource "null_resource" "deploy_k8s_manifests" {
  # It must wait for the cluster and node groups to be fully active
  depends_on = [
    aws_eks_cluster.main,
    aws_eks_node_group.group_1,
    aws_eks_node_group.group_2,
    helm_release.nginx_ingress, # Wait for ingress controller to be ready
    helm_release.cert_manager
  ]

  provisioner "local-exec" {
    # 1. Update the local kubeconfig to point to the new EKS cluster
    # 2. Apply the "App of Apps" parent manifest to trigger ArgoCD sync
    command = <<EOT
      aws eks update-kubeconfig --region ${var.region} --name ${var.cluster_name}
      kubectl apply -f ../argocd/app-of-apps.yaml
    EOT
  }
}
