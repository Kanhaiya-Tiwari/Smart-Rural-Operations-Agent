# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  role_arn = aws_iam_role.cluster.arn

  vpc_config {
    subnet_ids = aws_subnet.public[*].id
  }

  depends_on = [aws_iam_role_policy_attachment.cluster_AmazonEKSClusterPolicy]
}

# Add-on for EBS storage support
resource "aws_eks_addon" "ebs_csi" {
  cluster_name                = aws_eks_cluster.main.name
  addon_name                  = "aws-ebs-csi-driver"
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "PRESERVE"
  service_account_role_arn    = aws_iam_role.ebs_csi_role.arn
}

# Node Group 1
resource "aws_eks_node_group" "group_1" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "sroa-node-group-1"
  node_role_arn   = aws_iam_role.nodes.arn
  subnet_ids      = aws_subnet.public[*].id

  scaling_config {
    desired_size = 1
    max_size     = 2
    min_size     = 1
  }

  instance_types = ["c7i-flex.large"]

  tags = {
    Name = "sroa-node-group-1"
  }

  depends_on = [
    aws_iam_role_policy_attachment.nodes_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.nodes_AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.nodes_AmazonEC2ContainerRegistryReadOnly,
  ]
}

# Node Group 2
resource "aws_eks_node_group" "group_2" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "sroa-node-group-2"
  node_role_arn   = aws_iam_role.nodes.arn
  subnet_ids      = aws_subnet.public[*].id

  scaling_config {
    desired_size = 1
    max_size     = 2
    min_size     = 1
  }

  instance_types = ["c7i-flex.large"]

  tags = {
    Name = "sroa-node-group-2"
  }

  depends_on = [
    aws_iam_role_policy_attachment.nodes_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.nodes_AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.nodes_AmazonEC2ContainerRegistryReadOnly,
  ]
}
