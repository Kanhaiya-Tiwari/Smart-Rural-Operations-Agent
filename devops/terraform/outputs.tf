output "default_vpc_id" {
  value = data.aws_vpc.default.id
}

output "default_public_subnet_ids" {
  value = sort(data.aws_subnets.default.ids)
}

output "load_balancer_dns_name" {
  value = aws_lb.app.dns_name
}

output "autoscaling_group_name" {
  value = aws_autoscaling_group.app.name
}

output "autoscaling_group_arn" {
  value = aws_autoscaling_group.app.arn
}
