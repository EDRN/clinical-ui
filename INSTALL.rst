**************
 Installation
**************

To run Labcas's (EDRN's or MCL's) Portal 2.0+, you'll need the following:

• A Docker environment
• The Labcas 2.0 code, ``https://github.com/EDRN/clinical-ui.git``
• Docker has access to a labcas JWT/Solr API (Currently edrn/mcl/labcas-dev apis 
  are available within JPL servers)
• A public web server (such as Apache HTTPD, NGINX, AWS Elastic Load Balancer,
  etc.) which can host html/javascript code as client side web content.


🏃‍♀️ Getting Started
=========================

To get up and running quickly with the portal, try this::

    git clone https://github.com/EDRN/clinical-ui.git
    # move clinical-ui folder to apache root directory


🌳‍♀️ Configuration
=======================

Go into clinical-ui/assets/conf/environment.cfg and modify the json's environment 
variable, links, etc that is specific to your environment/context.


💁‍♀️ Public Web Server (Reverse Proxy)
===========================================

The next and final step is then to make the service available to the public internet.
You typically do this by running a separate web server, load balancer,
Elastic Load Balancer, etc., that reverse-proxies to the Docker Composition
(running from above). We'll assume that the public site will be available
by ``https`` (and that ``http`` requests get redirected to ``https``).
Configuring your web server/ELB/whatever for SSL/TLS is up to you.

By simply placing code at webserver root, clinical-ui should be available at root url of 
webserver.

❓ Questions, Comments, Etc.
=============================

If you run into any difficulties, you can contact the developer_ or the `EDRN
Informatics Center`_.  Bug reports and enhancement requests may also be filed
at the `issue tracker`_.


.. References:
.. _GitHub: https://github.com/EDRN/clinical-ui
.. _`EDRN Informatics Center`: mailto:ic-portal@jpl.nasa.gov
.. _`issue tracker`: https://github.com/EDRN/clinical-ui/issues
