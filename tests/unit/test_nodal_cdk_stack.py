import aws_cdk as core
import aws_cdk.assertions as assertions

from nodal_cdk.nodal_cdk_stack import NodalCdkStack

# example tests. To run these tests, uncomment this file along with the example
# resource in nodal_cdk/nodal_cdk_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = NodalCdkStack(app, "nodal-cdk")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
